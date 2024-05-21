const jwt = require('jsonwebtoken');
const multer = require("multer");
const { join } = require("path");

require('dotenv').config({
    path: "../.env"
});

const checkTokenValidity = (token, token_secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, token_secret, (err, results) => {
            if (err){
                reject(err);
            }
            resolve(results);
        })
    })
}

const createToken = (...data) => {
    return new Promise((resolve, reject) => {
        jwt.sign(data[0], data[1], { expiresIn: '10h', algorithm: 'HS256' }, (err, token)=>{
            if (err){
                reject(err)
            }
            resolve(token)
        })
    })
}

const showTime = () => {
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

    return { time };
}

function normalize(id){
    return atob(id).toString().split("").reverse().join("");
}

function reverse(id){
    return btoa(id.toString().split("").reverse().join(""));
}

//multer
const path = join(process.cwd(), "avatars");
const storageConfig = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, path)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const filterConfig = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" || file.mimetype === "image/webp"){
            cb(null, true)
    }else{
        cb(null, false)
    }
}

const checkCookie = async (handshake) => {
    try {
        let cookies = handshake.split(";");
        let cookie;
        for (const el of cookies){
            cookie = el.includes("session_token") ? el.slice("session_token=".length).trim(): ""
        }
        let data = await checkTokenValidity(
            cookie, process.env.JWT_SECRET);
        return data.id;
    }
    catch(e){
        console.error(e);
        return null;
    }
}


module.exports = {
    //jwt
    createToken, checkTokenValidity,
    //utils
    showTime, normalize, reverse, checkCookie,
    //multer
    storageConfig, filterConfig
}
