const express = require('express');
const routerPost = express.Router();

require('dotenv').config();

const { createToken } = require('./middleware');

const db = require("../db/index");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

routerPost.use(express.json());
routerPost.use(cookieParser());

routerPost.post('/auth/state/:action', async (req,res) => {
    const { action } = req.params;
    if (action === 'register') {
        const {email, password, password_conf, nickName} = req.body;
        if ('/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/'.match(email)){
            return res.status(401).send('Invalid email or password');
        }

        if (password !== password_conf){
            return res.status(401).send('Passwords do not match');
        }

        if (!typeof(nickName) === 'string'){
            return res.status(401).send('Invalid nickname');
        }

        const user = await db.getUser(email);

        if (user.length){
            return res.status(401).send('User already exists');
        }

        try{
             bcrypt.hash(password, 10, (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                db.addUser(email, data, nickName)
                return res.status(200).send("User has been registered");
             });
        }catch (e) {
            return res.status(500).send("Error registering user");
        }


    }else if(action === 'login'){
        const {email, password } = req.body;
        const user = await db.getUser(email);
        if (user.length === 0){
            return res.status(200).send("Invalid email or password");
        }
        try{
            const isMatch = await bcrypt.compare(password, user[0].password);
            if(isMatch){
                let token = await createToken({id: user[0].id, nick: user[0].nickname, mail: user[0].email}, process.env.JWT_SECRET);
                console.log(token)
                res.cookie("session_token", token, {maxAge: 36000000, httpOnly:true});
            }
            res.status(401).send("Invalid email or password");

        }catch (e) {
            return res.status(500).send("Error logging user");
        }
    }
})

module.exports = routerPost;