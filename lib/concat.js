var express = require('express'),
    path = require('path'),
    request = require('request');
var Concat = {}, app;

app = express();

app.all('/', function(req, res, next){
    var files = req.query.files && req.query.files.split(' ');
    if (files && files.length) {
        return concatOnTheFly(files, res);
    }
    next();
});

app.use('/', express.static(path.normalize(__dirname + '/../public')));

function concatOnTheFly(files, res){
    var data = "", f;

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