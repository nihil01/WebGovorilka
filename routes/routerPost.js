const express = require('express');
const routerPost = express.Router();
const multer = require("multer");
const fs = require("fs");
const { join } = require("path");

require('dotenv').config();

const { createToken, filterConfig, storageConfig, checkTokenValidity} = require('./middleware');
const encrypt = require("../cipher/encrypt");
const decrypt = require("../cipher/decrypt");
const getChat = require("../chats_utils/utils");

const db = require("../db/index");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

const processRequest = require("../microservices/emailReset");

routerPost.use(express.json());
routerPost.use(cookieParser());
routerPost.use(multer({storage: storageConfig, fileFilter: filterConfig}).single("avatar"));

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
            res.status(401).send("NO COOKIE")
        }
    }catch (e) {
        console.error(e);
    }
}

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
                    .then(data => {
                        const id = data[0]["id"];
                        const pathFromCopy = join(process.cwd(), "CONSTANTS", "DEFAULT_USER_IMAGE.png");
                        const pathToCopy = join(process.cwd(), "avatars", `avatar_${id}.webp`);

                        fs.copyFile(pathFromCopy, pathToCopy, (err) => {
                            if (err){
                                return console.error(err);
                            }
                            console.log("copy successful");
                        })
                    })
                    .catch(err => {
                        console.error(err)
                    })
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
        try {
            const isMatch = await bcrypt.compare(password, user[0].password);
            if (isMatch) {
                let token = await createToken({id: user[0].id, nick: user[0].nickname, mail: user[0].email}, process.env.JWT_SECRET);
                res.cookie("session_token", token, {maxAge: 36000000, httpOnly:true});
                res.json({success: true});
            } else {
                res.status(401).send("Invalid email or password"); // Ошибка в случае неверного email или пароля
            }
        } catch (e) {
            return res.status(500).send("Error logging user");
        }
    }
})

//requests from /more/profile route
routerPost.post("/request/:type", handleToken, async (req,res)=>{
    const { type } = req.params;
    const { id } = req.session_token;
    if (type === "change-avatar"){
        const file = req.file;
        if (!file || file.size > 1000){
            fs.rmSync(file.path);
            return res.json({error: "Ошибка при загрузке файла"})
        }else {
            fs.rename(file.path, `${join(process.cwd(), "avatars", `avatar_${id}.webp`)}`, (err, data)=>{
                if (err){
                    return res.json({error: "Ошибка при загрузке файла на сервер"})
                }
                return res.json({success: "Файл загружен"});
            });
        }
    }else if (type === "change-password"){
        const {pass1, pass2} = req.body;

        const password = await db.getUserByIdPswd(id);
        const isMatched = await bcrypt.compare(pass1, password[0].password);

        if (!isMatched){
            return res.json({error: "Invalid password !"})
        }

        const newPassword = await bcrypt.hash(pass2, 10);

        await db.updatePasswordById(id, newPassword);

        res.clearCookie("session_token")
        return res.json({success: "Password has been updated! Logging out ..."})
    }else if(type === "change-bio"){
        const { data } = req.body;
        if (data.length > 300){
            return res.json({error: "Invalid length !"})
        }

        await db.updateBioById(id, data);

        res.json({ success: "Bio changed!" })
    }
})

routerPost.post("/forgotPassword", async (req,res) => {
    const { email } = req.body;

    if (email === "" || !email || typeof email !== 'string'){
       return res.status(401).json({error: "Invalid input"})
    }

    if ('/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/'.match(email)){
        return res.status(401).send('Invalid email or password');
    }

    try{
        const data = await db.getUser(email);
        const userData = {
            nickname: data[0].nickname,
            email: data[0].email,
            ip: req.ip,
            cipher: encrypt(email)
        };

        processRequest(userData)
    }catch (e) {
        return res.status(401).json({ error: 'Bad request!' });
    }
})

routerPost.post("/passwordReset", async (req,res) => {
    const { psw1, psw2, hashVal } = req.body;

    if (psw1 !== psw2){
        return res.json({error: "passwords should be equal"});
    }

    const data = await db.restorePassByHashValue(hashVal)

    if (data.length){
        const email = decrypt({iv: data[0].iv, encryptedData: data[0].hash})
        await db.updatePasswordByMail(email, await bcrypt.hash(psw2, 10))
        await db.deactivateLink(hashVal)
        return res.status(200).json({success: "password changed"})
    }
    return res.status(400).json({error: "No data obtained"})

})

routerPost.post("/loadChat", handleToken, async(req,res) => {
    const id = req.session_token.id;
    const { userID } = req.body;
    console.log(userID)
    if (!userID){
        return res.json({"error": "No user ID!"})
    }

    const relation = await db.checkRelations(id, userID);
    console.log(relation)
    if (relation.length === 0){
        return res.json({"error": "No relation!"})
    }
    const chat = await getChat("READ", Object.values(relation[0]).join("_"));

    chat.map(el => {
        if (el.user === id.toString() || el.user === 'You'){
            el.user = "You"
        }else{
            el.user = "Abonent"
        }
        return chat
    })

    res.status(200).json({ chat });
})

module.exports = routerPost;
