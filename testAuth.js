const keys = require('.config / keys');

// https://www.haykranen.nl/2011/06/21/basic-http-authentication-in-node-js-using-the-request-module/
let request = require('request'),
	username = keys.users.user,
	password = keys.users.password,
	url = 'https://alpine-electronics.jamacloud.com/rest/v1/abstractitems',
	auth = 'Basic ' + new Buffer.from((username + ':' + password).toString('base64'));

request({
		url: url,
		headers: {
			Authorization: auth
		}
	},
	function (error, response, body) {
		// Do more stuff with 'body' here
		console.log(response.body);
	}
);







//-----FOR REF below-------//
var request = require('request'),
	username = keys.users.user,
	password = keys.users.password,
	startAt = 0,
	getProjectStartAt = 0,
	projectChosen = 'Project Name',
	resultCount,
	releaseNumber = 'Release_1.0',
	releaseUrl =
	'https://alpine-electronics.jamacloud.com/rest/v1/abstractitems?contains=' +
	releaseNumber +
	'&startAt=' +
	startAt +
	'&maxResults=50',
	getProjects =
	'https://alpine-electronics.jamacloud.com/rest/v1/projects?startAt=' + getProjectStartAt + '&maxResults=50',
	auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

request({
			url: releaseUrl,
			headers: {
				Authorization: auth
			}
		},
		function (error, response, body) {
			// Do more stuff with 'body' here

			let holdTestRunStatus = [];
			let holdTestRunStatusPassed = [];
			let holdTestRunStatusFailed = [];
			let holdTestRunStatusBlocked = [];

			//console.log(JSON.parse(response.body));
			let holdResponse = JSON.parse(response.body);
			//console.log('---' + holdResponse.data[3].fields.testRunStatus);

			for (i = 3; i < holdResponse.data.length; i++) {
				//console.log('testRunStatus for Release_1.0: ' + holdResponse.data[i]);
				holdTestRunStatus.push(holdResponse.data[i].fields.testRunStatus);
				if (holdResponse.data[i].fields.testRunStatus === 'FAILED') {
					holdTestRunStatusFailed.push(holdResponse.data[i].fields.testRunStatus);
				} else if (holdResponse.data[i].fields.testRunStatus === 'PASSED') {
					holdTestRunStatusPassed.push(holdResponse.data[i].fields.testRunStatus);
				} else if (holdResponse.data[i].fields.testRunStatus === 'BLOCKED') {
					holdTestRunStatusBlocked.push(holdResponse.data[i].fields.testRunStatus);
				}
			}

			console.log('holdTestRunStatus: ' + holdTestRunStatus);
			console.log('holdTestRunStatus count: ' + holdTestRunStatus.length);
			console.log('holdTestRunStatusPassed: ' + holdTestRunStatusPassed.length);
			console.log('holdTestRunStatusFailed: ' + holdTestRunStatusFailed.length);
			console.log('holdTestRunStatusBlocked: ' + holdTestRunStatusBlocked.length);
		}