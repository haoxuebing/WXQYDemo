var Client = require('node-rest-client').Client;
var client = new Client();
var Thenjs = require('thenjs');
var service = require('./service');

function getUserList(cb) {

    Thenjs(cont => {
        service.get_access_token(cont);
    }).then((cont, rlt) => {

        var url = 'https://qyapi.weixin.qq.com/cgi-bin/user/simplelist?access_token=' + process.access_token + '&department_id=1&fetch_child=FETCH_CHILD';

        client.get(url, function(data, response) {
            console.log(JSON.stringify(data));
            cb(null, data);
        })
    })
}

function updateUserInfo(cb) {

    Thenjs(cont => {
        service.get_access_token(cont);
    }).then((cont, rlt) => {
        var url = 'https://qyapi.weixin.qq.com/cgi-bin/user/update?access_token=' + process.access_token;

        var body = {
            headers: { "Content-Type": "application/json" },
            data: {
                userid: "1814850078572544",
                name: "李四",
                department: [1],
                order: [10],
                position: "后台工程师",
                mobile: "15811144444",
                gender: "1",
                email: "zhangsan@gzdev.com",
                isleader: 0,
                enable: 1,
                telephone: "020-123456",
                english_name: "jackzhang"
            }
        }

        client.post(url, body, function(data, response) {
            console.log(JSON.stringify(data));
            cb(null, data);
        })
    })
}

module.exports = {
    getUserList: getUserList,
    updateUserInfo: updateUserInfo
}