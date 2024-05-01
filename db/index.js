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


    //for friend listing
    async getUserById(userID){
        const data = await pool.query("SELECT id, nickname FROM users WHERE id = $1",
            [userID]);
        return data.rows;
    }

    //for password changing route
    async getUserByIdPswd(userID){
        const data = await pool.query("SELECT id, password FROM users WHERE id = $1",
            [userID]);
        return data.rows;
    }

    async getUserByIdBio(userID){
        const data = await pool.query("SELECT id, nickname, last_online, registered, bio FROM users WHERE id = $1",
            [userID]);
        return data.rows;
    }

    async updatePasswordById(userID, newPassword){
        return await pool.query("UPDATE users SET password = $1 WHERE id = $2",
            [newPassword, userID])
    }

    async updateBioById(userID, newBio){
        return await pool.query("UPDATE users SET bio = $1 WHERE id = $2",
            [newBio, userID])
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

    async checkBlockedUser(userId, friendId){
        const data = await pool.query("SELECT EXISTS(SELECT * FROM blocked_user WHERE user_id = $1 AND blocked_user_id = $2)",
            [friendId, userId]);
        return data.rows[0].exists;
    }

    async checkFriendship(userId, friendId){
        const data = await pool.query("SELECT EXISTS(SELECT * FROM friendships WHERE user_id = $1 AND friend_id = $2);",
            [userId, friendId]);
        return data.rows[0].exists;
    }

    async checkFriendQuery(userId, friendId){
        const data = await pool.query("SELECT EXISTS(SELECT * FROM friendships_requests WHERE sender = $1 AND recipient = $2);",
            [userId, friendId]);
        return data.rows[0].exists;
    }

    async addFriendQuery(userId, friendId){
        return await pool.query("INSERT INTO friendships_requests(sender, recipient) VALUES ($1, $2)",
            [userId, friendId]);
    }

    async removeFriendQuery(userId, friendId){
        return await pool.query("DELETE FROM friendships_requests WHERE sender = $1 AND recipient = $2",
            [friendId, userId]);
    }

    //selected user by name (fetch query)
    async getUserList(nickname){
        const data = await pool.query("SELECT id, nickname FROM users WHERE LOWER(nickname) LIKE $1 ORDER BY nickname DESC LIMIT 10",
            [`%${nickname}%`]);
        return data.rows;
    }

    //select all user's friends

    async selectAllFriends(userID){
        const data = await pool.query("SELECT * FROM friendships WHERE user_id = $1", [userID]);
        const friends = {};
        await Promise.all(data.rows.map(async el => {
            friends.friendsInfo = await this.getUserById(el.friend_id);
        }));

        return friends;
    }

    //select all friend requests to user

    async getFriendRequests(userID){
        const data1 = await pool.query("SELECT * FROM friendships_requests WHERE recipient = $1 GROUP BY sender, recipient ORDER BY recipient", [userID]);
        const sendersObj = {};
       await Promise.all(data1.rows.map(async el => {
           sendersObj.senderInfo = await this.getUserById(el.sender);
       }))

        return sendersObj;
    }

}

module.exports = new dbUtils();
