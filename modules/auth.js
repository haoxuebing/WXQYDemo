var Then = require('thenjs');
var Client = require('node-rest-client').Client;
var client = new Client();




function oauth2Redirect(req, res, oauth2Back) {
    if (req.query.corpid) {
        var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + req.session.corpid + '&redirect_uri=' + encodeURIComponent(oauth2Back) + '&response_type=code&scope=snsapi_base&state=' + 10 + '#wechat_redirect';
        res.redirect(url);
    } else {
        res.send('corpid错误！');
    }
}




function getUserId(req, res, oauth2Back, cb) {


    if (!req.query.code) {
        req.session.corpid = req.query.corpid;
        oauth2Redirect(req, res, oauth2Back);
    } else {
        var url = 'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=' + process.access_token + '&code=' + req.query.code;

        client.get(url, function(data, response) {
            console.log(JSON.stringify(data));
            req.session.wxuid = data.UserId;
            cb(null, data.UserId);
        })
    }

}


module.exports = {
    getUserId: getUserId
}