const crypto = require("crypto");

const iv = crypto.randomBytes(16);

module.exports = function encrypt(data) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.EMAIL_RESET_KEY),  iv);

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}
