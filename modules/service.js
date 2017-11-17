var Client = require('node-rest-client').Client;
var client = new Client();
var config = require('config');

var corpId = config.corpid;
var suite_id = config.suite_id;
var suite_secret = config.suite_secret;

//获取access_token
var get_access_token = function(cb) {
    var url = 'https://qyapi.weixin.qq.com/cgi-bin/service/get_corp_token?suite_access_token=' + process.suite_token;

    var body = {
        headers: { "Content-Type": "application/json" },
        data: {
            suite_id: suite_id,
            auth_corpid: process.CorpInfo.auth_corp_info.corpid,
            permanent_code: process.CorpInfo.permanent_code
        }
    }


    client.post(url, body, function(data, response) {
        process.access_token = data.access_token;
        cb(null, data);
    })
}

// 获取suite_token
var get_suite_token = function(cb) {
    var url = 'https://qyapi.weixin.qq.com/cgi-bin/service/get_suite_token';

    var body = {
        headers: { "Content-Type": "application/json" },
        data: {
            suite_id: suite_id,
            suite_secret: suite_secret,
            suite_ticket: process.SuiteTicket
        }
    }


    client.post(url, body, function(data, response) {
        process.suite_token = data.suite_access_token;
        if (cb != undefined) {
            cb(null, data);
        }
    })

}


//获取预授权码
var get_pre_auth_code = function(suite_token, cb) {
    var url = 'https://qyapi.weixin.qq.com/cgi-bin/service/get_pre_auth_code?suite_access_token=' + suite_token;

    var body = {
        headers: { "Content-Type": "application/json" },
        data: {
            suite_id: suite_id
        }
    }

    client.post(url, body, function(data, response) {
        cb(null, data);
    })
}

//设置授权应用
var set_session_info = function(suite_token, pre_auth_code, cb) {
    var url = 'https://qyapi.weixin.qq.com/cgi-bin/service/set_session_info?suite_access_token=' + suite_token;

    var body = {
        headers: { "Content-Type": "application/json" },
        data: {
            pre_auth_code: pre_auth_code,
            session_info: {
                appid: [1],
                auth_type: 1
            }
        }
    }

    client.post(url, body, function(data, response) {
        cb(null, data);
    })
}

//获取永久授权码
var get_permanent_code = function(suite_token, auth_code, cb) {
    var url = 'https://qyapi.weixin.qq.com/cgi-bin/service/get_permanent_code?suite_access_token=' + suite_token;

    var body = {
        headers: { "Content-Type": "application/json" },
        data: {
            suite_id: suite_id,
            auth_code: auth_code
        }
    }

    client.post(url, body, function(data, response) {
        cb(null, data);
    })
}

module.exports = {
    get_access_token: get_access_token,
    get_suite_token: get_suite_token,
    get_pre_auth_code: get_pre_auth_code,
    set_session_info: set_session_info,
    get_permanent_code: get_permanent_code
}