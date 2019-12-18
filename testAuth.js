// https://www.haykranen.nl/2011/06/21/basic-http-authentication-in-node-js-using-the-request-module/
var request = require('request'),
    username = "mrosik@alpine-usa.com",
    password = "Makalaka123",
    url = "https://alpine-electronics.jamacloud.com/rest/v1/projects",
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

request({
        url: url,
        headers: {
            "Authorization": auth
        }
    },
    function (error, response, body) {
        // Do more stuff with 'body' here
        console.log(response);
    }
);