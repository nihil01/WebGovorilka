const express = require('express');
const routerGet = express.Router();
const { checkTokenValidity } = require('./middleware.js');
const {join} = require("path");
const cookieParser = require("cookie-parser");

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

routerGet.get('/',  handleToken,(req, res) => {
    const date = new Date().getHours();
    let time;
    if (date >= 4 && date < 12){
        time = "☀️ Good Morning";
    }else if (date >= 12 && date < 15){
        time = "⛅️Good Day";
    }else if (date >= 15 && date < 18){
        time = "⛅Good Afternoon";
    }else if (date >= 18 && date < 22){
        time = "⛅️️️️Good Evening ";
    }else{
        time = "🌙Good Night";
    }
    const { nick, mail } = req.session_token;

    res.render(join(__dirname, '../client/static/views/components/chats.ejs'), {
        nick: nick,
        email: mail,
        time: time,
        includeHeader: true,
        includeFooter: true
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


module.exports = routerGet;