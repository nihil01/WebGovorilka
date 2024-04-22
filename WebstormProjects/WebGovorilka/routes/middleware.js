const jwt = require('jsonwebtoken');
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

module.exports = { createToken, checkTokenValidity  }
