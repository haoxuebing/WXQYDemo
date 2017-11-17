var fs = require("fs");
var service = require('../modules/service');

var contextPath = process.cwd() + '/config/context.json';
var corpInfoPath = process.cwd() + '/config/corpInfo.json';


var readSuitTicket = function() {
    if (fs.existsSync(contextPath)) {
        var s = fs.readFileSync(contextPath, 'utf-8').toString();
        if (s)
            process.SuiteTicket = JSON.parse(s).SuiteTicket;
    }
};

var saveSuitTicket = function(suiteMessage, cb) {
    process.SuiteTicket = suiteMessage.SuiteTicket; //suite_ticket

    if (!fs.existsSync(contextPath)) {
        fs.mkdir(contextPath);
    }

    var c = JSON.stringify(suiteMessage);

    var buffer = new Buffer(c);
    fs.open(contextPath, 'w', function(err, fd) {
        if (!err) {
            fs.write(fd, buffer, 0, buffer.length, 0, cb);
        }
    });
};

//保存永久授权码
var save_auth_code = function(req, res, resData) {

    //临时授权码 有过期时间需马上换取永久授权码  1200s
    var auth_code = req.query.auth_code;

    service.get_permanent_code(resData.suite_access_token, auth_code, (err, rlt) => {
        var buffer = new Buffer(JSON.stringify(rlt));
        fs.open(corpInfoPath, 'w', function(err, fd) {
            if (!err) {
                fs.write(fd, buffer, 0, buffer.length, 0, () => {
                    readCorpInfo();
                    res.send('授权完成');
                });
            }
        });
    });

}

var readCorpInfo = function() {
    if (fs.existsSync(corpInfoPath)) {
        var s = fs.readFileSync(corpInfoPath, 'utf-8').toString();
        if (s)
            process.CorpInfo = JSON.parse(s);
    }
}

//将xml2js解析出来的对象转换成直接可访问的对象
var formatMessage = function(result) {
    var message = {};
    if (typeof result === 'object') {
        for (var key in result) {
            if (result[key].length === 1) {
                var val = result[key][0];
                if (typeof val === 'object') {
                    message[key] = formatMessage(val);
                } else {
                    message[key] = (val || '').trim();
                }
            } else {
                message = result[key].map(formatMessage);
            }
        }
    }
    return message;
};


module.exports = {
    readSuitTicket: readSuitTicket,
    saveSuitTicket: saveSuitTicket,
    save_auth_code: save_auth_code,
    readCorpInfo: readCorpInfo,
    formatMessage: formatMessage
}