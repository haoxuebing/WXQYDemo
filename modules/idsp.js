var Thenjs = require('thenjs');
var Client = require('node-rest-client').Client;
var client = new Client();
var auth = require('./auth');
var aes = require('./aes');

function getUserInfo(req, res, authcallbask, cb) {

    Thenjs(cont => {
        auth.getUserId(req, res, authcallbask, cont);
    }).then((cont, rlt) => {
        var url = 'http://testjn14.iyunxiao.net/api/account/wechatlogin?wxuid=' + req.session.wxuid;

        client.post(url, function(data, response) {
            console.log(JSON.stringify(data));
            req.session.userInfo = data;
            if (cb)
                cb(null, data);
            else
                res.send(JSON.stringify(data));
        })
    })
}

function getUserCourse(req, res, authcallbask) {
    Thenjs(cont => {
        getUserInfo(req, res, authcallbask, cont);
    }).then((cont, rlt) => {

        var url = 'http://testjn14.iyunxiao.net/api/csh/GetCourseList?uid=' + req.session.userInfo.uid + '&schoolperiodid=' + req.session.userInfo.schoolperiodid + '&learnsection=' + req.session.userInfo.learnsection;
        var body = {
            headers: {
                "Token": aes.encrypt(req.session.userInfo.uid)
            }
        }

        client.post(url, body, function(data, response) {
            console.log(JSON.stringify(data));
            res.send(JSON.stringify(data));
        })

    })
}




module.exports = {
    getUserInfo: getUserInfo,
    getUserCourse: getUserCourse
}