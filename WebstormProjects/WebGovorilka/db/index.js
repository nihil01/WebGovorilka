require('dotenv').config({path: '../.env'});
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USERNAME,
    port: 5432,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
})

// function query(...args) {
//     return new Promise((resolve, reject) => {
//         if (args.length > 1){
//             pool.query(args[0], args[1], (err, data) => {
//                 if (err) {
//                     reject(err)
//                 }
//                 resolve(data.rows)
//             })
//         }else{
//             pool.query(args[0],(err, data) => {
//                 if (err) {
//                     reject(err)
//                 }
//                 resolve(data.rows)
//             })
//         }
//     })
// }


class dbUtils {
    //  registration / login
    async addUser(email, password, nickname){
        return await pool.query("INSERT INTO users(email, password, nickname) VALUES ($1,$2,$3)",
            [email, password, nickname]);
    }

    async getUser(email){
        const data = await pool.query("SELECT email, nickname, password FROM users WHERE email = $1",[email]);
        return data.rows;
    }

}



module.exports = new dbUtils();