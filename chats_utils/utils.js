const { open } = require("fs/promises");
const { createReadStream } = require("fs")
const { join } = require("path");
require("dotenv").config({
    path: "../.env"
})


async function getChat(data){
    const path = `C:\\Users\\Orkhan\\WebstormProjects\\WebGovorilka\\chats_data`;
    let fileHandle;

    try{
        fileHandle = await open(join(path, `${data.friend_a}_${data.friend_b}.txt`), 'r');
        if (fileHandle){
            return await formData(
                join(path, `${data.friend_a}_${data.friend_b}.txt`)
            );
        }
    }catch (e) {
        fileHandle = await open(join(path, `${data.friend_a}_${data.friend_b}.txt`), 'r');
        if (fileHandle){
            return await formData(
                join(path, `${data.friend_b}_${data.friend_a}.txt`)
            );
        }
    }finally{
        await fileHandle.close();
    }
}

async function formData(path){
    let stream = createReadStream(path, {encoding: "utf-8"});
    let splitted;
    return new Promise((resolve, reject)=>{
        stream.on("data", (data) => {
            splitted = data.split('\n');

            splitted = splitted.map(el => {
                return {
                    user: el.slice((`<USER_${process.env.CHAT_KEY}>`.length), el.indexOf(`</USER_${process.env.CHAT_KEY}>`)),
                    message: el.slice(el.indexOf(`<START_MESSAGE_${process.env.CHAT_KEY}>`) + `<START_MESSAGE_${process.env.CHAT_KEY}>`.length, el.indexOf(`<END_MESSAGE_${process.env.CHAT_KEY}>`)),
                    date: el.slice(el.indexOf(`<DATE_${process.env.CHAT_KEY}>`) + `<DATE_${process.env.CHAT_KEY}>`.length, el.indexOf(`</DATE_${process.env.CHAT_KEY}>`)),
                }
            })
        })
        stream.on("end", () => {
            resolve(splitted)
            stream.close();

        })
        stream.on("error", (err)=>{
            reject(err)
            stream.close();
        })
    })
}

module.exports = getChat;