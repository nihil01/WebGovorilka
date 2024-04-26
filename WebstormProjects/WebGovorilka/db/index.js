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
        const data = await pool.query("SELECT email, nickname, password FROM users WHERE email = $1",
            [email]);
        return data.rows;
    }


    //friend add / await friend request / block user

    async addFriend(userId, friendId){
        return await pool.query("INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2)",
            [userId, friendId]);
    }

    async removeFriend(userId, friendId){
        return await pool.query("DELETE FROM friendships WHERE user_id = $1 AND friend_id = $2",
            [userId, friendId]);
    }

    async blockUser(userId, friendId){
        return await pool.query("INSERT INTO blocked_user(user_id, blocked_user_id) VALUES ($1, $2)",
            [userId, friendId]);
    }

    async unBlockUser(userId, friendId){
        return await pool.query("DELETE FROM blocked_user WHERE user_id = $1 AND blocked_user_id = $2)",
            [userId, friendId]);
    }

    async addFriendQuery(userId, friendId){
        return await pool.query("INSERT INTO friendships_requests(sender, recipient) VALUES ($1, $2)",
            [userId, friendId]);
    }

    async removeFriendQuery(userId, friendId){
        return await pool.query("DELETE FROM FROM friendships_requests WHERE user_id = $1 AND friend_id = $2",
            [userId, friendId]);
    }

    //selected user by name (fetch query)
    async getUserList(nickname){
        const data = await pool.query("SELECT id, nickname FROM users WHERE LOWER(nickname) LIKE $1 ORDER BY nickname DESC",
            [`%${nickname}%`]);
        console.log(data.rows)
        return data.rows;
    }
}

const db = new dbUtils();

module.exports = new dbUtils();
