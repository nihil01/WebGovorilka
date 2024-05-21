const redis = require('redis');
require("dotenv").config({
    path: "../.env"
})

const conn = redis.createClient({
    url: `redis://${process.env.REDIS_DB_USERNAME}:${process.env.REDIS_DB_PASSWORD}@127.0.0.1:6379`
})

conn.on("connect", (conn) => {
    console.log('connected')
})

conn.on('ready', (err) => {
    console.log('ready')
})

conn.on('error', (err) => {
    console.log('error')
})

const main =  async () => {
    await conn.connect()
}

const checkPresence = async (userID) =>{
    try {
        return await conn.HGET(userID.toString(), `socketID`);
    } catch (e) {
        console.error(e);
    }
}

const createHash = async (userID, socketID) => {
    try {
        await conn.HSET(userID.toString(), "socketID", socketID);
    } catch (e) {
        console.error(e);
    }
}

const deleteHash = async (userID) => {
    try {
        const data =  conn.HKEYS(`${userID}`);
        (await data).forEach((el)=>{
            conn.HDEL(`${userID}`,`${el}`);
        })
        return true;
    }catch (e) {
        console.error(e);
        return false;
    }
}

main();

module.exports = { conn, checkPresence, createHash,
                    deleteHash };
