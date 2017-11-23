var Client = require('node-rest-client').Client;
var client = new Client();
var crypto = require('crypto');
var Thenjs = require('thenjs');
var uuidv1 = require('uuid/v1');
var config = require('config');
var service = require("./service");

var corp_tickets = {};

function get_corp_ticket(req, callback) {
    var corp_ticket = corp_tickets[req.session.corpid];
    if (corp_ticket && (new Date().getTime()) < (new Date(corp_ticket.expiresIn)).getTime()) {
        callback(null, corp_ticket.ticket);
    } else {
        Thenjs(cont => {
            service.get_req_access_token(req, cont);
        }).then((cont, token) => {
            var url = `https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=${token.access_token}`;
            client.get(url, function(data, response) {
                save_corp_ticket(req.session.corpid, data.ticket, data.expires_in);
                callback(null, data.ticket);
            });
        })
    }
}

function save_corp_ticket(corp_id, ticket, expires_in) {
    corp_tickets[corp_id] = {
        corpId: corp_id,
        ticket: ticket,
        expiresIn: new Date((new Date()).getTime() + (expires_in - 10) * 1000)
    };
}

function getJSAPIConfig(req, res, cb) {

    Thenjs(cont => {
        get_corp_ticket(req, cont);
    }).then((cont, ticket) => {
        var jsConfig = {
            jsapi_ticket: ticket,
            noncestr: uuidv1(),
            timestamp: parseInt(new Date().getTime() / 1000) + '',
            url: req.query.url2 || (req.host + req.originalUrl)
        }
        var string1 = "";
        var sortedKey = Object.keys(jsConfig); //ASCII 码从小到大排序
        for (var i = 0; i < sortedKey.length; i++) {
            var key = sortedKey[i];
            var value = jsConfig[key];
            string1 += key + "=" + value + "&";
        }
        string1 = string1.substring(0, string1.length - 1);
        jsConfig.signature = getSha1String(string1);
        jsConfig.corpid = req.session.corpid;
        cont(null, jsConfig);
    }).fin((cont, err, result) => {
        console.log(result);
        if (req.query.url2) {
            res.send(result);
        } else {
            cb(err, result);
        }
    })
}

function getSha1String(strCrypt) {
    console.log(strCrypt);
    var sha1 = crypto.createHash('sha1');
    sha1.update(strCrypt, 'utf8');
    var strCrypted = sha1.digest('hex');
    return strCrypted;
}

module.exports = {
    getJSAPIConfig: getJSAPIConfig
}