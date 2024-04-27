require('dotenv').config({path: '../.env'});
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USERNAME,
    port: 5432,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
})

class dbUtils {
    //  registration / login
    async addUser(email, password, nickname){
        return await pool.query("INSERT INTO users(email, password, nickname) VALUES ($1,$2,$3)",
            [email, password, nickname]);
    }

    async getUser(email){
        const data = await pool.query("SELECT id, email, nickname, password FROM users WHERE email = $1",
            [email]);
        return data.rows;
    }


    //friend add / await friend request / block user

    async addFriend(userId, friendId){
        return await pool.query("INSERT INTO friendships (id, friend_id) VALUES ($1, $2)",
            [userId, friendId]);
    }

    async removeFriend(userId, friendId){
        return await pool.query("DELETE FROM friendships WHERE id = $1 AND friend_id = $2",
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

    async checkFriendQuery(userId, friendId){
        const data = await pool.query("SELECT EXISTS(SELECT * FROM friendships_requests WHERE user_id = $1 AND friend_id = $2);",
            [userId, friendId]);
        return data.rows[0].exists;

    }

    async addFriendQuery(userId, friendId){
        return await pool.query("INSERT INTO friendships_requests(user_id, friend_id) VALUES ($1, $2)",
            [userId, friendId]);
    }

    async removeFriendQuery(userId, friendId){
        return await pool.query("DELETE FROM FROM friendships_requests WHERE user_id = $1 AND friend_id = $2",
            [userId, friendId]);
    }

    //selected user by name (fetch query)
    async getUserList(nickname){
        const data = await pool.query("SELECT id, nickname FROM users WHERE LOWER(nickname) LIKE $1 ORDER BY nickname DESC LIMIT 10",
            [`%${nickname}%`]);
        return data.rows;
    }
}

module.exports = new dbUtils();
