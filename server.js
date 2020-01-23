const express = require('express');
const authRoutes = require('./routes/auth-routes');
const app = express();
const bodyParser = require('body-parser');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const PORT = 3000;

//set up view engine
app.set('view engine', 'ejs');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
	bodyParser.urlencoded({
		// to support URL-encoded bodies
		extended : true
	})
);

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

var getProjectsStartAt = 0;
var getTestPlansStartAt = 0;
var getTestCyclesStartAt = 0;
var getTestRunsStartAt = 0;

var holdProjects = [];
var holdGetProjectIdsArray = [];
var holdGetProjectNamesArray = [];

var holdTestplans = [];
var holdGetTestplanIdsArray = [];
var holdGetTestplanNamesArray = [];

var holdTestcycles = [];
var holdTestCyclesArray = [];
var holdGetTestcycleIdsArray = [];
var holdGetTestcycleNamesArray = [];

var holdTestruns = [];
var holdGetTestrunIdsArray = [];
var holdGetTestrunNamesArray = [];
var holdTestrunResults = [];

var holdTestRunStatusPassed = 0;
var holdTestRunStatusFailed = 0;
var holdTestRunStatusBlocked = 0;

var projectChosen = 'Project Name';

//switch hardcoded to use what is input

var testCycleId = 34048;
var testCycleIdObj = {
	idVal : 34048,
	get idUpd() {
		return this.idVal;
	},
	set idUpd(val) {
		this.idVal = val;
	}
};

var testPlanId = 14953;
var testPlanIdObj = {
	idVal : 14953,
	get idUpd() {
		return this.idVal;
	},
	set idUpd(val) {
		this.idVal = val;
	}
};

var projectId = 48;
var projectIdObj = {
	idVal : 48,
	get idUpd() {
		return this.idVal;
	},
	set idUpd(val) {
		this.idVal = val;
	}
};

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
	'https://alpine-electronics.jamacloud.com/rest/v1/projects?startAt=' + getProjectsStartAt + '&maxResults=50';

function getProjectsFunction(startAt) {
	return 'https://alpine-electronics.jamacloud.com/rest/v1/projects?startAt=' + startAt + '&maxResults=50';
}

// 2 getTestPlans = returns list of testPlanIds int -- which is same as how many releases (ie Release_1.0) data[i].id = testPlanId, meta.pageInfo.totalResults, meta.pageInfo.resultCount
var getTestPlans =
	'https://alpine-electronics.jamacloud.com/rest/v1/testplans?project=' +
	projectIdObj.idUpd +
	'&startAt=' +
	getTestPlansStartAt +
	'&maxResults=50';

function getTestPlansFunction(projId, startAt) {
	getTestPlans =
		'https://alpine-electronics.jamacloud.com/rest/v1/testplans?project=' +
		projId +
		'&startAt=' +
		startAt +
		'&maxResults=50';
}

// 3 getTestCycles = returns test cycles -- how many cycles per release (testPlan), data[i].fields.name = "Cycle1", data[i].id = testCycleId
var getTestCycles =
	'https://alpine-electronics.jamacloud.com/rest/v1/testplans/' +
	testPlanIdObj.idUpd +
	'/testcycles?startAt=' +
	getTestCyclesStartAt +
	'&maxResults=50';

function getTestCyclesFunction(testPlanId, startAt) {
	return (
		'https://alpine-electronics.jamacloud.com/rest/v1/testplans/' +
		testPlanIdObj.idUpd +
		'/testcycles?startAt=' +
		startAt +
		'&maxResults=50'
	);
}

// 4 getTestRuns = returns list of testRunStatus per cycle for specific release -- data[i].fields.testRunStatus
var getTestRuns =
	'https://alpine-electronics.jamacloud.com/rest/v1/testcycles/' +
	testCycleIdObj.idUpd +
	'/testruns?startAt=' +
	getTestRunsStartAt +
	'&maxResults=50';

function getTestRunsFunction(testCycleId, startAt) {
	return (
		'https://alpine-electronics.jamacloud.com/rest/v1/testcycles/' +
		testCycleIdObj.idUpd +
		'/testruns?startAt=' +
		startAt +
		'&maxResults=50'
	);
}

// use testCycleIds to get list of testRunStatus from getTestRuns  // this may be irrelavent

var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

//-------------   express REST ----------------//
//submits a post
app.post('/project/runall', (req, res) => {
	projectIdObj.idUpd = req.body.projectId;
	testPlanIdObj.idUpd = req.body.testPlanId;
	testCycleIdObj.idUpd = req.body.testCycleId;
	//doProjectRequest();
});

//submits a projectId
app.post('/project:id', (req, res) => {
	projectId = req.params.projectId;
});

//submit testPlanId
app.post('/project/:testPlanId', (req, res) => {
	testPlanId = req.params.testPlanId;
});

// not sure this is needed yet
// app.post('/project/:testCycleId', (req, res) => {
//     testCycleId = req.params.testCycleId;
// });

//GET projects
app.get('/projects', (req, res) => {
	try {
		//execute get project request
		doProjectRequest();
		//send back all projects after small pause to get info into mem
		setTimeout(() => {
			res.send(holdProjects);
		}, 1000);
	} catch (err) {}
});

//GET testplans
app.get('/testplans', (req, res) => {
	try {
		//execute test plan request with latest project
		doTestPlanRequest();
		//sending back test plans - wait for function above to execute
		setTimeout(() => {
			res.send(holdTestplans);
		}, 1000);
	} catch (err) {}
});

//POST testplans
app.post('/testplans', (req, res) => {
	try {
		//send update to which test plan to use
		var holdIt = req.body.project;
		console.log('testplan post:  ' + holdIt);

		//projectIdObj.idUpd(holdIt);

		getTestPlansFunction(req.body.project, 0);

		setTimeout(() => {
			res.json(holdIt);
		}, 200);
	} catch (err) {}
});

//GET testcycles
app.get('/testcycles', (req, res) => {
	try {
		//sending back test cycles
		res.send(holdTestcycles);
	} catch (err) {}
});

//POST testcycles
app.post('/testcycles', (req, res) => {
	try {
		//send update to which test cycle to use
		getTestCyclesFunction(req.body.testplan, 0);
	} catch (err) {}
});

//GET test runs
app.get('/testruns', (req, res) => {
	try {
		//sending back test runs
		res.send(holdTestruns);
	} catch (err) {}
});

//POST testcycles
app.post('/testruns', (req, res) => {
	try {
		//send update to which test cycle to use
		getTestCyclesFunction(req.body.testcycle, 0);
	} catch (err) {}
});

//get request to start doProjectRequest() -- with default values
app.get('/runproject', (req, res) => {
	doProjectRequest();
});

//------------------- END REST ---------------//

//get back amount of keys that match obj request
function length(obj) {
	return Object.keys(obj).length;
}

//another way to get size of object (amount of keys)
function ObjectLength(object) {
	var length = 0;
	for (var key in object) {
		if (object.hasOwnProperty(key)) {
			++length;
		}
	}
	return length;
}

//doProjectRequest();

//return an object with project names and ids into holdProject object
function doProjectRequest() {
	request(
		{
			url     : getProjects,
			headers : {
				Authorization : auth
			}
		},
		function(error, response, body) {
			var holdGetProjects = JSON.parse(response.body);

			for (i = 0; i < holdGetProjects.data.length; i++) {
				// holdGetProjectIdsArray.push(holdGetProjects.data[i].id);
				// holdGetProjectNamesArray.push(holdGetProjects.data[i].projectKey);

				holdProjects[i] = {
					project_name : holdGetProjects.data[i].projectKey,
					project_id   : holdGetProjects.data[i].id
				};
			}
			console.log(holdProjects);
			//after having projectId we doTestPlanRequest()

			//may have to do these function calls in the routes above
			// doTestPlanRequest();
		}
	);
	// return holdProjects;
}

//return an object with testplan names and ids
function doTestPlanRequest() {
	holdTestPlans = [];
	console.log('holdTestPlans contains: ' + holdTestPlans);

	request(
		{
			url     : getTestPlans,
			headers : {
				Authorization : auth
			}
		},
		function(error, response, body) {
			var holdGetTestplans = JSON.parse(response.body);
			//need to find way to clear out object

			for (i = 0; i < holdGetTestplans.data.length; i++) {
				holdTestplans[i] = {
					testplan_name : holdGetTestplans.data[i].fields.name,
					testplan_id   : holdGetTestplans.data[i].id
				};
			}
			console.log(holdTestplans);

			//may have to do these function calls in the routes above
			// doTestCycleRequest();
		}
	);
}

//return an object with testcycle names and ids
function doTestCycleRequest() {
	request(
		{
			url     : getTestCycles,
			headers : {
				Authorization : auth
			}
		},
		function(error, response, body) {
			var holdGetTestcycles = JSON.parse(response.body);
			for (i = 0; i < holdGetTestcycles.data.length; i++) {
				holdTestcycles[i] = {
					testcycle_name : holdGetTestcycles.data[i].fields.name,
					testcycle_id   : holdGetTestcycles.data[i].id
				};
				holdTestCyclesArray.push(holdTestcycles[i].testcycle_id);
			}
			console.log(holdTestcycles);
			//console.log('holdTestCyclesArray: ' + holdTestCyclesArray);

			//may have to do these function calls in the routes above
			// doTestRunRequest();
		}
	);
}

//return an object with testcycle names and ids
function doTestRunRequest() {
	console.log('-------------------------------------------------------------------------------------');
	//clear out numbers in PASSED, FAILED, and BLOCKED first
	holdTestRuns = [];
	// console.log('In doTestRunRequest -- holdTestRuns contains: ' + holdTestRuns);

	console.log('testCyclesArray is: ' + holdTestCyclesArray);
	//need to do request for each test cycleID
	for (i = 0; i < holdTestCyclesArray.length; i++) {
		testCycleIdObj.idUpd = holdTestCyclesArray[i];

		console.log('amount in holdTestCycles -- # of testCycles:  ' + holdTestCyclesArray.length);
		console.log('this is current test cycle: ' + holdTestCyclesArray[i]);
		//itterate for each test cycleId

		console.log('value of testCycleID:  ' + testCycleIdObj.idUpd);

		request(
			{
				url     : getTestRunsFunction(testCycleIdObj.idUpd, 0),
				headers : {
					Authorization : auth
				}
			},
			function(error, response, body) {
				var holdGetTestruns = JSON.parse(response.body);

				console.log('returned test runs:  ' + holdGetTestruns.data.length);

				for (i = 0; i < holdGetTestruns.data.length; i++) {
					holdTestruns[i] = {
						testrun_name   : holdGetTestruns.data[i].fields.name,
						testrun_id     : holdGetTestruns.data[i].id,
						testrun_status : holdGetTestruns.data[i].fields.testRunStatus
					};
					if (holdGetTestruns.data[i].fields.testRunStatus == 'PASSED') {
						holdTestRunStatusPassed += 1;
					} else if (holdGetTestruns.data[i].fields.testRunStatus == 'FAILED') {
						holdTestRunStatusFailed += 1;
					} else if (holdGetTestruns.data[i].fields.testRunStatus == 'BLOCKED') {
						holdTestRunStatusBlocked += 1;
					}
				}
				console.log(holdTestruns);
			}
		);
	}

	console.log('-------------------------------------------------------------------------------------');
}

app.listen(PORT, () => {
	console.log('app now listening to requests on 3000');
});
