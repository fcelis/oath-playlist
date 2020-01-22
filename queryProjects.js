var querystring = require('querystring');
var http = require('http');

var keys = require('./config/keys');
var myUsername = keys.users.user;
var myPassword = keys.users.password;

var data = querystring.stringify({
    username: myUsername,
    password: myPassword
});

var auth = 'Basic ' + new Buffer(myUsername + ':' + myPassword).toString('base64');

var options = {
    host: 'https://alpine-electronics.jamacloud.com/rest/v1/projects?startAt=0&maxResults=50',
    port: 80,
    path: '',
    method: 'GET',
    headers: {

        'Content-Length': Buffer.byteLength(data),
        'Authorization': auth
    }
};

var req = http.request(options, function (res) {

    try {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log("body: " + chunk);
        });
    } catch (err) {

    }
});

req.write(data);
req.end();