const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const path = require('path');
// const cors = require("cors");

require("dotenv").config({
    path: "./.env"
})

const routerGet = require('./routes/routerGet.js');
const routerPost = require('./routes/routerPost.js');

const socket = require('socket.io');

const { checkTokenValidity, checkCookie } = require("./routes/middleware")
const { conn, createHash,
    checkPresence, deleteHash } = require("./redis/main")
const { getUserById } = require("./db/index")
const getChat= require("./chats_utils/utils");

app.set("views", path.join(__dirname, `./client/static/views`));
app.set("view engine", "ejs");

app.use('/api/v1', routerPost);
app.use('/', routerGet);
app.use(express.static(path.join(__dirname, 'client', 'static')));


const cert = fs.readFileSync('./cert/cert.pem');
const key = fs.readFileSync('./cert/key.pem');

const expressServer = https.createServer({key, cert}, app);

const io = socket(expressServer, {
    cors: {
        origin: [
            "https://localhost:8000",
            "https://192.168.0.48:8000",
            "https://192.168.0.106:8000",
            "https://192.168.0.115:8000"
        ],
        methods: ["GET", "POST"]
    }
});
expressServer.listen(8000);

const offers = [];
const connectedSockets = [];
const roomUserCounts = {};
let roomNameCopy = "";

io.on('connection',async (socket)=>{
    const userName = socket.handshake.auth.userName;
    //WEB CHAT LOGIC IMPLEMENTATION
    const cookieVal = await checkCookie(socket.handshake.headers.cookie);

    if (cookieVal !== null){
        await createHash(cookieVal, socket.id);
    }else{
        console.log("invalid cookie");
        return;
    }

    socket.on('disconnect', async () => {

        const cookieVal = await checkCookie(socket.handshake.headers.cookie);
        if (cookieVal !== null){
            await deleteHash(cookieVal);
        }else{
            console.log("invalid cookie");
        }
    });

    socket.on("checkUserStatus", async(userID)=>{
        const result = await checkPresence(userID)
        socket.emit("checkUserStatus", result !== null);
    });

    socket.on("sendRequestToRecipient", async (userID, caller, joinLink) => {
        const data = await checkPresence(userID);
        let callerUpd = await getUserById(caller);
        socket.to(data).emit("incomingCall", { user: callerUpd[0].nickname, joinLink });
    });

    socket.on('joinRoom', (roomName) => {
        if (!roomUserCounts[roomName]) {
            roomUserCounts[roomName] = 0;
        }

        roomUserCounts[roomName]++;

        socket.join(roomName);

        console.log(`User joined room ${roomName}. User count: ${roomUserCounts[roomName]}`);

        // Отправляем обновленное количество пользователей всем в комнате
        io.in(roomName).emit("roomInfo", roomUserCounts[roomName]);

        socket.on('disconnect', () => {
            if (roomUserCounts[roomName]) {
                roomUserCounts[roomName]--;
                console.log(`User left room ${roomName}. User count: ${roomUserCounts[roomName]}`);

                // Отправляем обновленное количество пользователей всем в комнате
                io.in(roomName).emit("roomInfo", {status: "disconnect"});

                if (roomUserCounts[roomName] === 0) {
                    delete roomUserCounts[roomName];
                }
            }
        });
    });

    socket.on("JOIN_REQUEST", (cb) => {
        const cb2 = cb.split("_").sort((a,b) => a - b ).join("");
        socket.join(cb2);

        socket.on("message", async (data)=>{
            let cookies = socket.handshake.headers.cookie.split(";");
            let cookie;
            for (const el of cookies){
                cookie = el.includes("session_token") ? el.slice("session_token=".length).trim(): ""
            }
            const info = await checkTokenValidity(
                cookie, process.env.JWT_SECRET);
            getChat("WRITE", cb, {id: info.id, data});
            socket.in(cb2).emit("new_message", data);
        })
    })



    //WEB RTC LOGIC IMPLEMENTATION


    connectedSockets.push({
        socketId: socket.id,
        userName
    })

    //a new client has joined. If there are any offers available,
    //emit them out
    if(offers.length){
        socket.emit('availableOffers',offers);
    }

    socket.on('newOffer',newOffer=>{
        offers.push({
            offererUserName: userName,
            offer: newOffer,
            offerIceCandidates: [],
            answererUserName: null,
            answer: null,
            answererIceCandidates: []
        })
        // console.log(newOffer.sdp.slice(50))
        //send out to all connected sockets EXCEPT the caller
        socket.broadcast.emit('newOfferAwaiting',offers.slice(-1))
    })

    socket.on('newAnswer',(offerObj,ackFunction)=>{
        console.log(offerObj);
        //emit this answer (offerObj) back to CLIENT1
        //in order to do that, we need CLIENT1's socketid
        const socketToAnswer = connectedSockets.find(s=>s.userName === offerObj.offererUserName)
        if(!socketToAnswer){
            console.log("No matching socket")
            return;
        }
        //we found the matching socket, so we can emit to it!
        const socketIdToAnswer = socketToAnswer.socketId;
        //we find the offer to update so we can emit it
        const offerToUpdate = offers.find(o=>o.offererUserName === offerObj.offererUserName)
        if(!offerToUpdate){
            console.log("No OfferToUpdate")
            return;
        }
        //send back to the answerer all the iceCandidates we have already collected
        ackFunction(offerToUpdate.offerIceCandidates);
        offerToUpdate.answer = offerObj.answer
        offerToUpdate.answererUserName = userName
        //socket has a .to() which allows emiting to a "room"
        //every socket has it's own room
        socket.to(socketIdToAnswer).emit('answerResponse',offerToUpdate)
    })

    socket.on('sendIceCandidateToSignalingServer',iceCandidateObj=>{
        const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
        // console.log(iceCandidate);
        if(didIOffer){
            //this ice is coming from the offerer. Send to the answerer
            const offerInOffers = offers.find(o=>o.offererUserName === iceUserName);
            if(offerInOffers){
                offerInOffers.offerIceCandidates.push(iceCandidate)
                // 1. When the answerer answers, all existing ice candidates are sent
                // 2. Any candidates that come in after the offer has been answered, will be passed through
                if(offerInOffers.answererUserName){
                    //pass it through to the other socket
                    const socketToSendTo = connectedSockets.find(s=>s.userName === offerInOffers.answererUserName);
                    if(socketToSendTo){
                        socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromServer',iceCandidate)
                    }else{
                        console.log("Ice candidate recieved but could not find answere")
                    }
                }
            }
        }else{
            //this ice is coming from the answerer. Send to the offerer
            //pass it through to the other socket
            const offerInOffers = offers.find(o=>o.answererUserName === iceUserName);
            const socketToSendTo = connectedSockets.find(s=>s.userName === offerInOffers.offererUserName);
            if(socketToSendTo){
                socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromServer',iceCandidate)
            }else{
                console.log("Ice candidate recieved but could not find offerer")
            }
        }
    })

})

process.on("SIGINT",  async ()=>{
    console.log("Shutting down ...");
        await conn.quit();
        console.log("Cleared hashes ...");
        console.log("Redis shut down ...");

    expressServer.close((e)=>{
        console.log("Express server closed", e);
        process.exit(0);
    })
})
