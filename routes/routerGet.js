require("dotenv").config();
const express = require('express');
const routerGet = express.Router();

const { checkTokenValidity, showTime, normalize, reverse } = require('./middleware.js');
const {join} = require("path");
const { time } = showTime();

const cookieParser = require("cookie-parser");
const db = require("../db/index");
const fs = require('fs');

routerGet.use(express.json())
routerGet.use(cookieParser())

const handleToken = async (req, res, next) => {
    try{

        const cookies = req.cookies['session_token'];
            if (cookies) {
            const valid = await checkTokenValidity(cookies, process.env.JWT_SECRET)
            if (valid){
                req.session_token = valid;
                next()
            }else{
                res.status(401).send("Invalid token");
            }
        }else{
            res.redirect("/auth?state=login")
        }
    }catch (e) {
        console.error(e);
        res.redirect("/auth?state=login")
    }
}

//VIEW SERVING ROUTES

routerGet.get('/',  handleToken, async (req, res) => {
    const { nick, mail, id } = req.session_token;
    let data = await db.selectAllChats(req.session_token.id)
    console.log(data)
    let friends = [];
    if (data.length){
        await Promise.all(data.map(async el => {
            let val = Object.values(el);
            let friendID = val[0] === id ? val[1] : val[0];
            friends.push(
                (await db.getUserById(friendID))[0]
            )
        }))
    }
    console.log(friends)
    res.render(join(__dirname, '../client/static/views/components/chats.ejs'), {
        id: id,
        nick: nick,
        email: mail,
        time: time,
        friends: friends,
    });
})

routerGet.get('/auth', (req, res) => {
    const { state } = req.query;
    if (state === "register") {
        res.render(join(__dirname, '../client/static/views/components/register.ejs'));
    }
    else if (state === 'login') {
        res.render(join(__dirname, '../client/static/views/components/login.ejs'));
    }
})

routerGet.get("/more/:detail", handleToken, async (req,res) => {
    const { detail } = req.params;
    const { id, nick, mail } = req.session_token;

    if (detail === "menu"){
        res.render(join(__dirname, '../client/static/views/components/menu.ejs'), {nick: nick,
            email: mail, time:time});
    }else if(detail === "profile"){
        const userData = await db.getUserByIdBio(id);
        console.log(req.session_token.id)
        res.render(join(__dirname, '../client/static/views/components/profile.ejs'), {nick: nick,
            email: mail, time: time, id: id, data: userData[0]});
    }
})


//BACKEND LOGIC ROUTES
//fetch user profiles according to recipient's input value
let requestTime = null;
routerGet.get(`/fetch/userList/:contacts`,handleToken, async (req,res) => {
    const { contacts } = req.params;

    if (!(typeof contacts === "string")){
        res.status(401).json({error: "Invalid input type"})
    }

    const newDate = new Date();

    if (requestTime && newDate - requestTime < 1500){
        return res.status(429).json({ error: "Too Many Requests" });
    }

    requestTime = newDate;

    const result = await db.getUserList(contacts.toLowerCase());
    let data = [];
    result.map(el => {
        data.push({id: reverse(el.id), nickname: el.nickname})
    })
    return res.status(200).json(data);
})

//split fetching into sending friend request AND submitting friend request by query parameters
routerGet.get("/fetch/user", handleToken, async (req,res)=> {
    let { addFriend,  userID, requestType } = req.query;
    const { id } = req.session_token;
    //requests

    if (addFriend && !userID && !requestType){
        const friendID = normalize(addFriend);

        const isBlocked = await db.checkBlockedUser(id, friendID);

        if (isBlocked){
            return res.status(200).json({error: `You can't send request to this user!` })
        }

        const areFriends = await db.checkFriendship(id, friendID);

        if (areFriends){
            return res.status(200).json({warn: `You are already friends!` })
        }

        const isFriendExist = await db.checkFriendQuery(id, friendID);

        if(isFriendExist){
            return res.status(200).json({warn: `You have already sent friend request to the user! Wait for approval` })
        }else {
            //adding to friendship query
            await db.addFriendQuery(id, friendID);
            return res.status(200).json({success: `Friend request was successfully send!`})
        }
    }else if (!addFriend && userID && requestType){
        userID = normalize(userID)
        if (requestType === "block"){
            try{
                const exists = await db.checkFriendQuery(id, userID);
                if (!exists){
                    return res.status(401).json({error: "Invalid bunch"})
                }

                await db.blockUser(id, userID)
                res.status(200).json({success: "You blocked the user!"})

            }catch (e) {
                res.status(500).json({error: "Unexpected behavior"})
            }
        }else if (requestType === "submit"){
           try{
               const exists = await db.checkFriendQuery(id, userID);
               if (!exists){
                   return res.status(401).json({error: "Invalid bunch"})
               }
               await db.removeFriendQuery(id, userID);
               await db.addFriend(id, userID)

               res.status(200).json({success: "You are now friends!"})

           }catch (e) {
               res.status(500).json({error: "Unexpected behavior"})
           }
        }else if(requestType === "reject"){
            try{
                const exists = await db.checkFriendQuery(id, userID);
                if (!exists){
                    return res.status(401).json({error: "Invalid bunch"})
                }
                await db.removeFriendQuery(id, userID);
                res.status(200).json({success: "You rejected friend request!"})

            }catch (e) {
                res.status(500).json({error: "Unexpected behavior"})
            }
        }
        else{
            res.status(400).json({error: "Invalid request type"});
        }
    }
})

//split fetching into sending showing friends AND showing friendship requests by query parameters (ONLY VISUAL)
routerGet.get("/fetch", handleToken, async (req,res) => {
    const { userState, userID } = req.query;
    const { id } = req.session_token;
    console.log(userState, userID)

    if (userState === "showFriends"){
        const friends = await db.selectAllFriends(id);
        console.log(friends.friendsInfo)
        friends.friendsInfo ? res.status(200).json(friends) : res.status(200).json({error: "No friends"})
    }else if (userState === "showRequests"){
        let requests = await db.getFriendRequests(id);

        try{
            if (requests.senderInfo.length){
                requests = requests.senderInfo.map(request => {
                    return {
                        id: btoa((request.id.toString()).split("").reverse().join("")), nickname: request.nickname
                    }})
                res.status(200).json(requests);
            }
        }catch (e) {
            res.status(200).json({error: "No friend requests"})
        }


    }else if(userState === "showRelations" && userID){

        const subF = async () => {
            return await db.checkRelations(req.session_token.id, userID)
        }

        const response = await subF();

        if (!response[0]){
            db.createRelation(req.session_token.id, userID)
                .then(_ => {
                    const path = join(process.cwd(), 'chats_data', `${req.session_token.id}_${userID}.txt`);
                    fs.appendFileSync(path, '');
            })
        }
        return res.status(200).json({ success: true });
    }

})

routerGet.get("/fetch/avatar/:userID", handleToken, (req, res) => {
  try{
        const filePath = join(process.cwd(), 'avatars', `avatar_${req.params.userID}.webp`);
        fs.open(filePath, "r", (err, data) => {
            if(err){
                return console.error(err)
            }
            res.status(200).sendFile(filePath);
            fs.close(data, (err) => {
                if (err){
                    return console.error(err)
                }
            })
        });
    } catch (e) {
        res.status(403).json({ error: 'Access denied'});
    }
});

routerGet.get("/fetch/request/logout", (req,res) => {
    res.clearCookie("session_token");
    res.json({ success: true });
})

routerGet.get("/passwordReset/:hash", async (req,res) => {
    const { hash } = req.params;

    let data = await db.restorePassByHashValue(hash);

    if (data.length === 0){
        return res.status(401).json({"error": "link has been expired or invalid"})
    }

    res.render(join(__dirname, '../client/static/views/components/passReset.ejs'))
})

routerGet.get("/call", handleToken, function(req,res){
    const { re } = req.query;
    const credentials = re.split("_");
    const id = req.session_token.id;

    if (!re){
        return res.json({ error: "Something went wrong..." })
    }
    try{
        if (parseInt(credentials[0]) !== id && parseInt(credentials[1]) !== id){
            return res.json({ error: "Something went wrong..." })
        }

        if (parseInt(credentials[0]) === req.session_token.id){
            return res.render(join(__dirname, '../client/static/views/components/callPage.ejs'), {
                id: id,
                user: credentials[1]
            });
        }else{
            return res.render(join(__dirname, '../client/static/views/components/callPage.ejs'), {
                id: id, user: credentials[0]
            });
        }
    }catch (e) {
        return res.json({ error: "Something went wrong..." })
    }
})



module.exports = routerGet;