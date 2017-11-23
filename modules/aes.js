var crypto = require('crypto');


var key = 'mobile987DEF@joyschool.cn0000000',
    iv = 'AreyounySnowman?';

/**
 * 加密方法
 * @param key 加密key
 * @param iv       向量
 * @param data     需要加密的数据
 * @returns string
 */
var encrypt = function(data) {
    var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    var crypted = cipher.update(data, 'utf8', 'binary');
    crypted += cipher.final('binary');
    crypted = new Buffer(crypted, 'binary').toString('base64');
    return crypted;
};

/**
 * 解密方法
 * @param key      解密的key
 * @param iv       向量
 * @param crypted  密文
 * @returns string
 */
var decrypt = function(crypted) {
    crypted = new Buffer(crypted, 'base64').toString('binary');
    var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    var decoded = decipher.update(crypted, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
};

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
}

// var key = 'mobile987DEF@joyschool.cn0000000';
// console.log('加密的key:', key.toString('hex'));
// var iv = 'AreyounySnowman?';
// console.log('加密的iv:', iv);
// var data = "5c3bb4fe-2fcc-49b7-b58a-10520a8a0fb2";
// console.log("需要加密的数据:", data);
// var crypted = encrypt(key, iv, data);
// console.log("数据加密后:", crypted);
// var dec = decrypt(key, iv, crypted);
// console.log("数据解密后:", dec);