var querystring = require('querystring');
var http = require('http');
var express = require('express');
var app = express();
var keys = require('./config/keys');

var myUsername = keys.users.user;
var myPassword = keys.users.password;
var auth = 'Basic ' + new Buffer(myUsername + ':' + myPassword).toString('base64');

var PORT = 3000;

var BASE_URL = 'https://alpine-electronics.jamacloud.com/rest/v1/projects?startAt=0&maxResults=50';

app.get('/projects', (req, res) => {

    const options = {
        url: BASE_URL,
        headers: {
            'Authorization': auth
        }
    };
    http.get(options).pipe(res);
    //res.send();
})

app.listen(PORT, () => {
    console.log('app now listening to requests on 3000');
});