const date = new Date();

const year = date.getFullYear().toString().slice(2)
const month = (date.getMonth() + 1).toString().length > 2 ? (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString().padStart(2, '0')
const day = date.getDate().toString().length > 2 ? date.getDate().toString() : date.getDate().toString().padStart(2, '0')
const hours = `${date.getHours()}:${date.getMinutes()}`

const timestamp = `${day}.${month}.${year} | ${hours}`
module.exports = timestamp;