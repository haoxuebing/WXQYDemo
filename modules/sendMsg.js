var Thenjs = require('thenjs');
var Client = require('node-rest-client').Client;
var client = new Client();
var service = require('./service');
var auth = require('./auth');
var formstream = require('formstream');
var API = require('wechat-enterprise-api');
var path = require('path');
var fs = require('fs');
var needle = require('needle');

//发消息
function send(req, res) {

    Thenjs(cont => {
        if (process.access_token) {
            cont(null, process.access_token);
        } else {
            service.get_req_access_token(req, cont);
        }
    }).then((cont, rlt) => {
        auth.getUserId(req, res, 'http://testwxqy1.iyunxiao.net/sendMsg', cont)
    }).then((cont, rlt) => {

        var url = 'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=' + process.access_token;

        var body = {
            headers: { "Content-Type": "application/json" },
            data: {
                touser: req.session.wxuid,
                toparty: "",
                totag: "",
                msgtype: "text",
                agentid: process.CorpInfo.auth_info.agent[0].agentid,
                text: {
                    content: 'Hello World\n这个测试程序在一定程度上具有特殊的象征意义。在过去的几十年间，这个程序已经渐渐地演化成为了一个久负盛名的传统。几乎所有的程序员，无论是在你之前，或在你之后，当第一次实现与计算机成功沟通之后，在某种程度上，他们的肾上腺素就会急剧上升（激动不已）'
                },
                safe: 0

            }
        }
        client.post(url, body, function(data, response) {
            console.log(JSON.stringify(data));
            res.send(JSON.stringify(data));
        })
    }).fail((cont, err) => {
        res.send(JSON.stringify(err));
    })

}



//发附件
function sendFile(req, res) {
    Thenjs(cont => {
        if (process.access_token) {
            cont(null, process.access_token);
        } else {
            service.get_req_access_token(req, cont);
        }
    }).then((cont, rlt) => {
        auth.getUserId(req, res, 'http://testwxqy1.iyunxiao.net/sendFile', cont)
    }).then((cont, rlt) => {

        var url = 'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=' + process.access_token;

        var body = {
            headers: { "Content-Type": "application/json" },
            data: {
                touser: req.session.wxuid,
                toparty: "",
                totag: "",
                msgtype: "image",
                agentid: process.CorpInfo.auth_info.agent[0].agentid, //'1000046',
                image: {
                    "media_id": "3-V6oGol9DKqF0y79_YtHfAd3vIvPQEqxI9nl24sjAo0"
                },
                safe: 0

            }
        }
        client.post(url, body, function(data, response) {
            console.log(JSON.stringify(data));
            res.send(JSON.stringify(data));
        })
    }).fail((cont, err) => {
        res.send(JSON.stringify(err));
    })
}

function uploadFile(req, res) {
    Thenjs(cont => {
        req.query.corpid = 'wxf05619abc5582129';
        if (process.access_token) {
            cont(null, process.access_token);
        } else {
            service.get_req_access_token(req, cont);
        }
    }).then((cont, rlt) => {
        var filepath = process.cwd() + '/pic/1.png';

        var api = new API(null, null, 10, function(callback) {
            callback(null, {
                accessToken: process.access_token
            });
        }, null);

        api.uploadMedia(filepath, 'image', function(err, data) {
            console.log(data.media_id);
            res.send(data);
        })


        // fs.stat(filepath, function(err, stat) {
        // var form = formstream();
        // form.file('media', filepath, path.basename(filepath), stat.size);

        // var url = 'https://qyapi.weixin.qq.com/cgi-bin/media/upload?access_token=' + process.access_token + '&type=image';

        // var opts = {
        //     image: {
        //         filelength: stat.size,
        //         file: filepath,
        //         filename: path.basename(filepath),
        //         content_type: 'image/png'
        //     }
        // };

        // var options = {
        //     multipart: true
        // }
        // needle.post(url, opts, options, function(error, response, body) {
        //     console.log('Upload successful!  Server responded with:', body);
        //     res.send(body);
        // });
        // var body = {
        //     headers: form.headers(),
        //     data: {
        //         stream: form
        //     }
        // }
        // client.post(url, body, function(data, response) {
        //     console.log(JSON.stringify(data));
        //     res.send(JSON.stringify(data));
        // })
        // })
    })
}


module.exports = {
    send: send,
    sendFile: sendFile,
    uploadFile: uploadFile
}