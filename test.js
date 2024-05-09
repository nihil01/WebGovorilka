// const fs = require("fs/promises");
// const path = "C:\\Users\\Orkhan\\WebstormProjects\\WebGovorilka\\test.txt";
//
// (async function() {
//     require("dotenv").config()
//
//     const message = "<USER_"+process.env.KEY+">Mashka2003</USER_"+process.env.KEY+">: <START_MESSAGE_"+process.env.KEY+">Hello<END_MESSAGE_"+process.env.KEY+">, <DATE_"+process.env.KEY+">1.1.1.1</DATE_"+process.env.KEY+">"+ "\n";
//     await fs.appendFile(path, message);
//
//     let data = await fs.readFile(path, {encoding: "utf-8"});
//     const splitted = data.split('\n');
//     let fd = splitted.map(el => {
//       return {
//               user: el.slice(el.indexOf(`<USER_${process.env.KEY}>`) + `<USER_${process.env.KEY}>`.length, el.indexOf(`<USER_${process.env.KEY}>`)),
//               message: el.slice(el.indexOf(`<START_MESSAGE_${process.env.KEY}>`) + `<START_MESSAGE_${process.env.KEY}>`.length, el.indexOf(`<END_MESSAGE_${process.env.KEY}>`)),
//               data: el.slice(el.indexOf(`<DATE_${process.env.KEY}>`) + `<DATE_${process.env.KEY}>`.length, el.indexOf(`</DATE_${process.env.KEY}>`))
//           }
//     })
//     console.log(fd)
// }())

require("dotenv").config()


let splitted = [
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    '<USER_309f8fc4>Mashka2003</USER_309f8fc4>: <START_MESSAGE_309f8fc4>Hello<END_MESSAGE_309f8fc4>, <DATE_309f8fc4>1.1.1.1</DATE_309f8fc4>',
    ''
]

// splitted.map(el => {
//     console.log({
//         user: el.slice((`<USER_${process.env.CHAT_KEY}>`.length), el.indexOf(`</USER_${process.env.CHAT_KEY}>`)),
//         message: el.slice(el.indexOf(`<START_MESSAGE_${process.env.CHAT_KEY}>`) + `<START_MESSAGE_${process.env.CHAT_KEY}>`.length, el.indexOf(`<END_MESSAGE_${process.env.CHAT_KEY}>`)),
//         date: el.slice(el.indexOf(`<DATE_${process.env.CHAT_KEY}>`) + `<DATE_${process.env.CHAT_KEY}>`.length, el.indexOf(`</DATE_${process.env.CHAT_KEY}>`)),
//     })
// })

