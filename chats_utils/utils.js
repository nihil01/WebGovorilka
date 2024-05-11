const { open } = require("fs/promises");
const { createReadStream } = require("fs");
const { join } = require("path");
const date = require("../date");
const fs = require("fs");

require("dotenv").config({
    path: "../.env"
})

const path = `C:\\Users\\Orkhan\\WebstormProjects\\WebGovorilka\\chats_data`;

async function existsToRead(data){
    let fileHandle;

    const inner = async (data) => {
        try{
            fileHandle = await open(join(path, `${data}.txt`), 'r');
            if (fileHandle){
                await fileHandle.close();
                return await formData(
                    join(path, `${data}.txt`)
                );
            }
        }catch (e) {
            console.error('file doesn\'t exist!');
        }
    }

    if (!data){
        return;
    }

    const result = await inner(data[0]);

    if (!result){
        return await inner(data[1])
    }
    return result

}

async function existsToWrite(data, writeD){
    let fileHandle;

    const inner = async(data) => {
        try{
            fileHandle = await open(join(path, `${data}.txt`), 'r');
            if (fileHandle){
                await fileHandle.close();
                return await writeData(
                    join(path, `${data}.txt`), writeD
                );
            }
        }catch (e) {
            console.error('file doesn\'t exist!', e);
        }
    }
    if (!data){
        return;
    }

    const result = await inner(data[0]);

    if (!result){
        return await inner(data[1])
    }
    return result

}

async function getChat(status, chatData, writeData = null){
    chatData = [chatData, chatData.split("_").reverse().join("_")];
    console.log(chatData)
    if (status === "READ"){
        return await existsToRead(chatData);
    }else if (status === "WRITE" && writeData){
        return await existsToWrite(chatData, writeData)
    }

}

async function formData(path){
    let stream = createReadStream(path, { encoding: "utf-8" });
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

async function writeData(path, writeD){
    let stream = fs.createWriteStream(path, { flags: "a", encoding: "utf-8" });
    console.log(writeD)
    return new Promise((resolve, reject) => {
        stream.write(`<USER_${process.env.CHAT_KEY}>${writeD.id}</USER_${process.env.CHAT_KEY}>:<START_MESSAGE_${process.env.CHAT_KEY}>${writeD.data}<END_MESSAGE_${process.env.CHAT_KEY}>, <DATE_${process.env.CHAT_KEY}>${date}</DATE_${process.env.CHAT_KEY}>\n`);

        stream.on("close", () => {
            resolve(true);
            stream.close();
        })

        stream.on("error", (err) => {
            reject(err);
            stream.close();
        })
    })

}

module.exports = getChat;