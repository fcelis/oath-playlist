const express = require('express');
const authRoutes = require('./routes/auth-routes');
const app = express();
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const PORT = 3000;

//set up view engine
app.set('view engine', 'ejs');

//connec t to mongodb
mongoose.connect(
	keys.mongodb.dbURI,
	{
		useUnifiedTopology : true,
		useNewUrlParser    : true
	},
	() => {
		console.log('connected to mongodb');
	}
);

//setup routes
// app.use('/auth', authRoutes);

//set static dir for calling files directly
app.use(express.static(__dirname + '/'));

//create home route
app.get('/', (req, res) => {
	res.render('home');
});

// ----->

// https://www.haykranen.nl/2011/06/21/basic-http-authentication-in-node-js-using-the-request-module/
var request = require('request');
var username = keys.users.user;
var password = keys.users.password;

var testRunID = [];
var startAt = 0;

var getTestRunsStartAt = 0;
var getTestCyclesStartAt = 0;
var getTestPlansStartAt = 0;
var getProjectStartAt = 0;

var projectChosen = 'Project Name';

var testCycleId;
var testPlanId;
var projectId = 48;

var resultCount;
var releaseNumber = 'Release_1.0';

// just for testing
var releaseUrl =
	'https://alpine-electronics.jamacloud.com/rest/v1/abstractitems?contains=' +
	releaseNumber +
	'&startAt=' +
	startAt +
	'&maxResults=50';

//will get back JSON objects with the following data to push into new arrays

// 1 getProjects  = returns list of projects int data[i].id = projectId, meta.pageInfo.totalResults, meta.pageInfo.resultCount, data[i].fields.name = "a Tuner"
var getProjects =
	'https://alpine-electronics.jamacloud.com/rest/v1/projects?startAt=' + getProjectStartAt + '&maxResults=50';

// 2 getTestPlans = returns list of testPlanIds int -- which is same as how many releases (ie Release_1.0) data[i].id = testPlanId, meta.pageInfo.totalResults, meta.pageInfo.resultCount
var getTestPlans =
	'https://alpine-electronics.jamacloud.com/rest/v1/testplans?project=' +
	projectId +
	'&startAt=' +
	getTestPlansStartAt +
	'&maxResults=50';

// 3 getTestCycles = returns test cycles -- how many cycles per release (testPlan), data[i].fields.name = "Cycle1", data[i].id = testCycleId
var getTestCycles =
	'https://alpine-electronics.jamacloud.com/rest/v1/testplans/' +
	testPlanId +
	'/testcycles?startAt=' +
	getTestCyclesStartAt +
	'&maxResults=50';

// 4 getTestRuns = returns list of testRunStatus per cycle for specific release -- data[i].fields.testRunStatus
var getTestRuns =
	'https://alpine-electronics.jamacloud.com/rest/v1/testcycles/' +
	testCycleId +
	'/testruns?startAt=' +
	getTestRunsStartAt +
	'&maxResults=50';

// use testCycleIds to get list of testRunStatus from getTestRuns  // this may be irrelavent

var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

request(
	{
		url     : releaseUrl,
		headers : {
			Authorization : auth
		}
	},
	function(error, response, body) {
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
);

// Try superagent to get data

// const superagent = require('superagent');

// (async function () {
//     const response = await superagent.get('https://alpine-electronics.jamacloud.com/rest/v1/abstractitems')
//     console.log(response.text)
// })();

//

// <-----

app.listen(PORT, () => {
	console.log('app now listening to requests on 3000');
});

////-------------------------- CODE BELOW IS JUST FOR REFERENCE --------------------------------------/////

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 3004;

const Event = require('./models/Events');
const Names = require('./models/Names');

//const Post = require('./models/Post');
//import routes
const postsRoute = require('./routes/posts');

// let machineEvents;

//require('dotenv/config');
require('dotenv').config();

//middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/posts', postsRoute);

let allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', '*');
	next();
};

//app.use(allowCrossDomain);

//Routes
app.get('/', (req, res, next) => {
	res.send('we are on home url');
	// try {DB
	//     const posts = await Post.find();
	//     console.log(posts);
	//     res.json(posts);
	// } catch (err) {
	//     res.json({
	//         message: err
	//     });
	// }
});

app.get('/chart', async (req, res) => {
	res.sendFile('./routes/chart-data.html', {
		root : __dirname
	});
});

app.get('/barchart', async (req, res) => {
	res.sendFile('./routes/bar.html', {
		root : __dirname
	});
});

app.post('/events', async (req, res) => {
	const post = new Event({
		name       : req.body.name,
		date       : req.body.date,
		machine_id : req.body.machine_id
	});

	try {
		const savedPost = await post.save();
		//res.type('json');
		res.json(savedPost);
	} catch (err) {
		res.send({
			message : err
		});
	}
});

app.get('/events', async (req, res) => {
	try {
		const posty = await Event.find().sort({
			date : 1
		});
		//console.log('GET: ' + posty);
		res.json(posty);
	} catch (err) {
		res.json({
			message : err
		});
	}
	console.log('...after GET Event called...');
});

//get events by machine id
app.get('/events/:m_id', async (req, res) => {
	try {
		console.log('event by MiD: ' + req.params.m_id);
		const machineEvents = await Event.find({
			machine_id : req.params.m_id,
			date       : {
				$gte : new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000)
			}
		})
			.sort({
				date : 1
			})
			.limit(10000);
		//console.log(res.json(specificMachinePost));
		res.json(machineEvents);
	} catch (err) {
		res.json({
			message : err
		});
	}
	console.log('...after GET Event for machine_id ...');
});

//deletes events, by machine - in progress... - works, deleted events by using Event model below after await
app.delete('/events/machine/:postId', async (req, res) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', '*');
	try {
		const removedEvent = await Event.deleteMany({
			machine_id : req.params.postId
		});
		console.log(removedEvent);
		res.json(removedEvent);
	} catch (err) {
		res.json({
			message : err
		});
	}
});

//for posting names equivalent to machine_ids
//submits a post
app.post('/names', async (req, res) => {
	const namez = new Names({
		name       : req.body.name,
		machine_id : req.body.machine_id
	});

	try {
		const savedPost = await namez.save();
		res.json(savedPost);
	} catch (err) {
		res.send({
			message : err
		});
	}
});

//getting back names
app.get('/names', async (req, res) => {
	try {
		const posty = await Names.find().sort({
			date : 1
		});
		//console.log('GET: ' + posty);
		res.json(posty);
	} catch (err) {
		res.json({
			message : err
		});
	}
	console.log('...after /names called...');
});

//connect to db
//https://hackernoon.com/deploying-a-node-app-on-amazon-ec2-d2fb9a6757eb
//You don’t need “dotenv” to read the environment variables. Set the variables in your .bash_profile you should be able to see that process.env.MYAPIKEY no problem.
mongoose.connect(
	process.env.DB_CONNECTION,
	{
		useNewUrlParser : true
	},
	() => {
		console.log('connected to db');
	}
);
app.use(express.static('img'));
//start listening to server
app.listen(PORT);
// process.env.PORT ||
// process.env.DB_CONNECTION

//------------------------------------EASY FETCH--------------------------------------//
retrieveStatus = async (url) => {
	try {
		const res = await fetch(url);
		const { status } = res;
		return status;
	} catch (err) {
		// handle error for example
		console.error(err);
	}
};
//Then You can use it with any url You want to:

retrieveStatus('https://api.github.com/users/github');

///--------------------------------------EASY  count number of elements in json obj -----------------------//
function length(obj) {
	return Object.keys(obj).length;
}

length(data); // returns 1
length(data.name_data); // returns 4
