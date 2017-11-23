var express = require('express');
var router = express.Router();
var xml2js = require('xml2js');
var Thenjs = require('thenjs');
var WXBizMsgCrypt = require("wechat-crypto");
var config = require('config');

var corpId = config.corpid;
var suite_id = config.suite_id;
var token = config.token;
var encodingAESKey = config.encodingAESKey;
var authCallbackUrl = config.authCallbackUrl;
var cryptor = new WXBizMsgCrypt(token, encodingAESKey, corpId);

var service = require('../modules/service');
var wxContent = require('../modules/wxContent');
wxContent.readSuitTicket();
wxContent.readCorpInfo();
service.get_suite_token();
var tongxunlu = require('../modules/tongxunlu');
var sendMsg = require('../modules/sendMsg');
var jssdk = require('../modules/jssdk');
var idsp = require('../modules/idsp');

var resData = {};

/* GET home page. */
router.get('/', function(req, res, next) {
    Thenjs(cont => {
        resData.SuiteTicket = process.SuiteTicket;
        service.get_suite_token(cont);
    }).then((cont, rlt) => {
        resData.suite_access_token = rlt.suite_access_token || rlt.errmsg;
        service.get_pre_auth_code(rlt.suite_access_token, cont);
    }).then((cont, rlt) => {
        resData.pre_auth_code = rlt.pre_auth_code || rlt.errmsg;

        resData.preUrl = 'https://qy.weixin.qq.com/cgi-bin/loginpage?suite_id=' + suite_id +
            "&pre_auth_code=" + resData.pre_auth_code + "&redirect_uri=" +
            encodeURIComponent(authCallbackUrl) + "&state=OK";

        service.set_session_info(resData.suite_access_token, resData.pre_auth_code, cont);
    }).then((cont, rlt) => {
        console.log('is Ok');
        res.render('index', { title: 'Express', resData: resData });
    }).fail((cont, err) => {
        res.render('index', { title: 'Express', resData: JSON.stringify(err) });
    })


});

router.get('/idspUserInfo', function(req, res, next) {
    idsp.getUserInfo(req, res, 'http://testwxqy.yunxiao.com/idspUserInfo');
})

router.get('/getUserCourse', function(req, res, next) {
    idsp.getUserCourse(req, res, 'http://testwxqy.yunxiao.com/getUserCourse');
})


router.get('/sendMsg', function(req, res, next) {
    sendMsg.send(req, res);
})

router.get('/sendFile', function(req, res, next) {
    sendMsg.sendFile(req, res);
})

router.get('/testjssdk', function(req, res, next) {
    req.session.corpid = req.query.corpid;
    res.render('testjssdk');
})

router.get('/jssdk', function(req, res, next) {
    jssdk.getJSAPIConfig(req, res);
})

router.get('/uploadFile', function(req, res, next) {
    sendMsg.uploadFile(req, res);
})

router.get('/wx/idsp/auth_callback', function(req, res, next) {
    wxContent.save_auth_code(req, res, resData);
})

router.get('/userinfo', function(req, res, next) {
    Thenjs(cont => {
        tongxunlu.getUserList(cont);
    }).then((cont, rlt) => {
        res.send(JSON.stringify(rlt));
    })
})

router.get('/updateUserInfo', function(req, res, next) {
    Thenjs(cont => {
        tongxunlu.updateUserInfo(cont);
    }).then((cont, rlt) => {
        res.send(JSON.stringify(rlt));
    })
})

router.get('/wx/suit', function(req, res, next) {
    var echostr = req.query.echostr;
    var s = cryptor.decrypt(echostr);
    res.send(s.message);
});



//获取微信推送ticket
router.post('/wx/suit', function(req, res, next) {

    console.log('微信回调');

    var buffers = [];
    req.on('data', function(trunk) {
        buffers.push(trunk);
    })
    req.on('end', function() {
        var xmlStr = Buffer.concat(buffers).toString('utf8');

        Thenjs(cont => {
            xml2js.parseString(xmlStr, { trim: true }, cont);
        }).then((cont, result) => {
            var xml = wxContent.formatMessage(result.xml);
            var encryptMessage = xml.Encrypt;

            var decrypted = cryptor.decrypt(encryptMessage);
            var messageWrapXml = decrypted.message;

            console.log(messageWrapXml);
            xml2js.parseString(messageWrapXml, { trim: true }, cont);
        }).then((cont, result) => {
            var suiteMessage = wxContent.formatMessage(result.xml);
            console.log(suiteMessage);

            if (suiteMessage.InfoType == 'suite_ticket') {
                wxContent.saveSuitTicket(suiteMessage, (err, written, string) => {
                    res.writeHead(200);
                    res.end('success');
                });
            } else {
                res.writeHead(200);
                res.end('success');
            }

        }).fail((cont, err) => {
            console.log('err:' + err);
            res.send('success');
        })

    })

});



module.exports = router;