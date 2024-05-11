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

const { checkTokenValidity } = require("./routes/middleware")

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
            "https://localhost",
            "https://192.168.0.48",
            "https://192.168.0.106"
        ],
        methods: ["GET", "POST"]
    }
});
expressServer.listen(8000);

const offers = [];
const connectedSockets = [];

io.on('connection',(socket)=>{
    //WEB CHAT LOGIC IMPLEMENTATION
    console.log('connected!')

    socket.on("JOIN_REQUEST", (cb) => {
        const cb2 = cb.split("_").sort((a,b) => a - b ).join("");
        socket.join(cb2);
        console.log("someone joined room", cb2)

        socket.broadcast.in(cb2).emit("new_user","Someone joined the room!");

        socket.on("message", async (data)=>{
            let cookies = socket.handshake.headers.cookie.split(";");
            let cookie;
            for (const el of cookies){
                cookie = el.includes("session_token") ? el.slice("session_token=".length).trim(): ""
            }
            console.log(cookie)
            const info = await checkTokenValidity(
                cookie, process.env.JWT_SECRET);
            getChat("WRITE", cb, {id: info.id, data});
            console.log({id: info.id, data})
            socket.broadcast.in(cb2).emit("new_message", data);
        })
    })



    //WEB RTC LOGIC IMPLEMENTATION

    // if(password !== "x"){
    //     socket.disconnect(true);
    //     return;
    // }

    connectedSockets.push({
        socketId: socket.id,
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

process.on("SIGINT", ()=>{
    console.log("Shutting down ...")
    expressServer.close((e)=>{
        console.log("Server closed", e)
        process.exit(0)
    })
})
