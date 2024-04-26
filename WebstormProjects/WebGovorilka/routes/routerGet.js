require("dotenv").config();
const express = require('express');
const routerGet = express.Router();
const { checkTokenValidity, showTime } = require('./middleware.js');
const {join} = require("path");
const cookieParser = require("cookie-parser");
const { time } = showTime();
const db = require("../db/index");
const {normalizeType} = require("express/lib/utils");


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

routerGet.get('/',  handleToken, (req, res) => {
    const { nick, mail } = req.session_token;

    res.render(join(__dirname, '../client/static/views/components/chats.ejs'), {
        nick: nick,
        email: mail,
        time: time,
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

routerGet.get("/details/:detail", handleToken, (req,res) => {
    const { detail } = req.params;
    const { nick, mail } = req.session_token;

    if (detail === "friends"){
        res.render(join(__dirname, '../client/static/views/components/friends.ejs'), {nick: nick,
            email: mail, time:time});
    }else if(detail === "profile"){
        res.render(join(__dirname, '../client/static/views/components/profile.ejs'), {nick: nick,
            email: mail, time:time});
    }else if(detail === "invites"){
        res.render(join(__dirname, '../client/static/views/components/invites.ejs'), {nick: nick,
            email: mail, time:time});
    }
})

let requestTime = null;
routerGet.get(`/fetch/contactList/:contacts`, async (req,res) => {
    const { contacts } = req.params;

    if (!(typeof contacts === "string")){
        res.status(401).json({error: "Invalid input type"})
    }

    const newDate = new Date();

    if (requestTime && newDate - requestTime < 1500){
        return res.status(429).json({ error: "Too Many Requests" });
    }

    requestTime = newDate;

    function reverse(id){
        return btoa(id.toString().split("").reverse().join(""))
    }

    const result = await db.getUserList(contacts.toLowerCase());
    let data = [];
    result.map(el => {
        data.push({id: reverse(el.id), nickname: el.nickname})
    })
    return res.status(200).json(data);
})



module.exports = routerGet;