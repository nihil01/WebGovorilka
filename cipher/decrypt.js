const crypto = require("crypto");

module.exports = function decrypt(data){
    try{
        const iv =  Buffer.from(`${data.iv}`, 'hex');
        const encryptedData = Buffer.from(data.encryptedData, 'hex');

        let decipher = crypto.createDecipheriv('aes-256-cbc', process.env.EMAIL_RESET_KEY, iv);
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()])
        return decrypted.toString();
    }catch (e) {
        return null
    }
}
