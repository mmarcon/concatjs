var express = require('express'),
    path = require('path'),
    request = require('request'),
    crypto = require('crypto'),
    email = require("emailjs/email");

var Concat = {}, app, cache = {}, cachesize = 0,
MAX_CACHE_SIZE = 50,
AUTH_CODE = process.env.auth || Date.now(),
MAIL_USER = process.env.sm_user || 'none',
MAIL_PASSWORD = process.env.sm_password || 'none',
MAIL_SENDER = process.env.mail_sender || "YOU <you@gmail.com>",
MAIL_RECIPIENT = process.env.mail_recipient || "ME <me@gmail.com>";

app = express();

app.all('/', function(req, res, next){
    var files = req.query.files && req.query.files.split(' ');
    if (files && files.length) {
        return concatOnTheFly(files, res);
    }
    next();
});

app.get('/flush', function(req, res){
    if(req.query.auth === AUTH_CODE) {
        var server  = email.server.connect({
           user: MAIL_USER,
           password: MAIL_PASSWORD,
           host: "smtp.gmail.com",
           ssl: true
        });
        server.send({
           text:    "Cache flushed on " + Date(),
           from:    MAIL_SENDER,
           to:      MAIL_RECIPIENT,
           subject: "jHERE Custom - Cache Flushed"
        }, function(err, message) {
            res.send(200, {result: 'OK'});
        });
    } else {
        res.send(401, {result: 'unauthorized'});
    }
});

app.use('/', express.static(path.normalize(__dirname + '/../public')));

function flushCache(){
    cache = {};
    cachesize = 0;
}

function isCacheable(data){
    return data && data.length < 102400;
}

function concatOnTheFly(files, res){
    var data = "", f, key = crypto.createHash('md5').update(files.join('-')).digest("hex");

    if(cache[key]) {
        res.header('Pragma', 'no-cache');
        res.header('Content-Disposition', 'attachment; filename=jhere-custom.js');
        return res.send(cache[key]);
    }

    function fetch(file) {
        var f;
        request.get({url: file}, function(error, request, body){
            if(error){
                return res.send(500, {error: 'error while fetching' + file});
            }
            data += body;
            f = files.shift();
            if(f) {
                return fetch(f);
            }

            if(cachesize >= MAX_CACHE_SIZE) {
                flushCache();
            }
            if(isCacheable(data)) {
                cache[key] = data;
                cachesize++;
            }
            res.header('Pragma', 'no-cache');
            res.header('Content-Disposition', 'attachment; filename=jhere-custom.js');
            return res.send(data);
        });
    }

    f = files.shift();
    fetch(f);
}

Concat.listen = function(port){
    app.listen(port);
};

module.exports = Concat;