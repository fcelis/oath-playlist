const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const PORT = 3000;

//set up view engine
app.set('view engine', 'ejs');
app.use(bodyParser.json()); // to support JSON-encoded bodies

app.use(cors());
app.use(
	bodyParser.urlencoded({
		// to support URL-encoded bodies
		extended: true
	})
);

//connec t to mongodb
mongoose.connect(
	keys.mongodb.dbURI, {
		useUnifiedTopology: true,
		useNewUrlParser: true
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
var holdGetTestruns;

var holdTestRunStatusPassed = 0;
var holdTestRunStatusFailed = 0;
var holdTestRunStatusBlocked = 0;
var holdTestRunStatusNotrun = 0;

var projectChosen = 'Project Name';

//switch hardcoded to use what is input

var testCycleId;
var testCycleIdObj = {
	idVal: 0,
	get idUpd() {
		return this.idVal;
	},
	set idUpd(val) {
		this.idVal = val;
	}
};

var testPlanId;
var testPlanIdObj = {
	idVal: 0,
	get idUpd() {
		return this.idVal;
	},
	set idUpd(val) {
		this.idVal = val;
	}
};

var projectId;
var projectIdObj = {
	idVal: 0,
	get idUpd() {
		return this.idVal;
	},
	set idUpd(val) {
		this.idVal = val;
	}
};

var holdTestPlansObj = {
	tpVal: {},
	get tpUpd() {
		return this.tpVal;
	},
	set tpUpd(val) {
		this.tpVal = val;
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
	getProjects = 'https://alpine-electronics.jamacloud.com/rest/v1/projects?startAt=' + startAt + '&maxResults=50';
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
	//return getTestPlans;

}

// 3 getTestCycles = returns test cycles -- how many cycles per release (testPlan), data[i].fields.name = "Cycle1", data[i].id = testCycleId
var getTestCycles =
	'https://alpine-electronics.jamacloud.com/rest/v1/testplans/' +
	testPlanIdObj.idUpd +
	'/testcycles?startAt=' +
	getTestCyclesStartAt +
	'&maxResults=50';

function getTestCyclesFunction(testPlanId, startAt) {
	getTestCycles =
		'https://alpine-electronics.jamacloud.com/rest/v1/testplans/' +
		testPlanId +
		'/testcycles?startAt=' +
		startAt +
		'&maxResults=50';
}

// 4 getTestRuns = returns list of testRunStatus per cycle for specific release -- data[i].fields.testRunStatus
var getTestRuns =
	'https://alpine-electronics.jamacloud.com/rest/v1/testcycles/' +
	testCycleIdObj.idUpd +
	'/testruns?startAt=' +
	getTestRunsStartAt +
	'&maxResults=50';

function getTestRunsFunction(testCycleId, startAt) {
	getTestRuns =
		'https://alpine-electronics.jamacloud.com/rest/v1/testcycles/' +
		testCycleId +
		'/testruns?startAt=' +
		startAt +
		'&maxResults=50';
}

// use testCycleIds to get list of testRunStatus from getTestRuns  // this may be irrelavent

var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

//-------------   express REST ----------------//
//submits a post
// app.post('/project/runall', (req, res) => {
// 	projectIdObj.idUpd = req.body.projectId;
// 	testPlanIdObj.idUpd = req.body.testPlanId;
// 	testCycleIdObj.idUpd = req.body.testCycleId;
// 	//doProjectRequest();
// });

//submits a projectId
// app.post('/project:id', (req, res) => {
// 	projectId = req.params.projectId;
// });

//submit testPlanId
// app.post('/project/:testPlanId', (req, res) => {
// 	testPlanId = req.params.testPlanId;
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
	//try {
	//execute test plan request with latest project
	doTestPlanRequest();
	//sending back test plans - wait for function above to execute
	setTimeout(() => {
		res.send(holdTestplans);
	}, 1000);
	//} catch (err) {}
});

//POST testplans
app.post('/testplans', (req, res) => {
	try {
		//send update to which test plan to use
		holdTestplans.length = 0;
		var holdIt = req.body.project;
		console.log('testplan post:  ' + holdIt);

		//projectIdObj.idUpd(holdIt);
		//need to check if more than 50 results and then replace number 0
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
		doTestCycleRequest();
		//sending back test plans - wait for function above to execute
		setTimeout(() => {
			res.json(holdTestcycles);
			//doTestRunRequest();
		}, 1000);
	} catch (err) {}
});

//GET testcycles for specific testplan
// app.get('/testcycles/:testplanId', (req, res) => {
// 	try {
// 		let testcyclesPlan = req.params.testplanId;
// 		getTestCyclesFunction(testcyclesPlan, 0);
// 		//sending back test cycles
// 		doTestCycleRequest();
// 		//sending back test plans - wait for function above to execute
// 		setTimeout(() => {
// 			res.json(holdTestcycles);
// 		}, 1000);
// 	} catch (err) {}
// });

//POST testcycles
app.post('/testcycles', (req, res) => {
	try {


		var holdTestplan = JSON.parse(req.body.testplan);
		//last thing changed.... 2.11.20 - 8:30
		testPlanIdObj.idUpd = holdTestplan;
		console.log('Testplan submitted for next testcycle: ' + holdTestplan);
		//send update to which test cycle to use
		getTestCyclesFunction(req.body.testplan, 0);
		//doTestCycleRequest();
		setTimeout(() => {
			res.json(holdTestplan);
			//holdTestplan contains testcycle_name: '' and testcycle_id: '' //
			doTestCycleRequest();
		}, 200);
	} catch (err) {}
});

//GET test runs
app.get('/testruns', (req, res) => {
	try {
		//sending back test cycles
		doTestRunRequest();
		//sending back test plans - wait for function above to execute
		setTimeout(() => {
			res.json(holdTestruns);
			//console.log('holdTestRuns is: ' + holdTestruns);
		}, 2000);
	} catch (err) {}
});

//POST testcycles
app.post('/testruns', (req, res) => {
	try {
		var holdTestcycle = JSON.parse(req.body.testcycle);

		console.log('Testcycle submitted for next testrun: ' + holdTestcycle);
		//send update to which test cycle to use
		testCycleIdObj.idUpd = JSON.parse(req.body.testcycle);
		console.log('testCycleIdObj.idUpd is: ' + testCycleIdObj.idUpd);
		if (testCycleIdObj.idUpd != undefined || testCycleIdObj.idUpd != null || testCycleIdObj.idUpd != 0) {
			getTestRunsFunction(testCycleIdObj.idUpd, 0);
		}

		//res.json(holdTestcycle);
		// setTimeout(() => {
		// 	//doTestRunRequest();
		// 	//res.json(holdTestcycle);
		// }, 200);
	} catch (err) {}
});

//get results back
app.get('/results', (req, res) => {
	console.log('getting results back for pass/fail/not run');
	doTestRunRequest();

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

//clear out projects
function emptlyHoldProjects() {
	holdProjects.length = 0;
}

//clear out holdTestPlans
function emptlyHoldTestPlans() {
	holdTestplans.length = 0;
}

//clear out holdTestCycles
function emptlyHoldTestCycles() {
	holdTestcycles.length = 0;
	holdTestCyclesArray.length = 0;
}

//clear out holdTestruns
function emptlyHoldTestruns() {
	holdTestruns.length = 0;
}

//return an object with project names and ids into holdProject object
function doProjectRequest() {
	request({
			url: getProjects,
			headers: {
				Authorization: auth
			}
		},
		function (error, response, body) {
			emptlyHoldProjects();
			var holdGetProjects = JSON.parse(response.body);

			for (i = 0; i < holdGetProjects.data.length; i++) {
				holdProjects[i] = {
					project_name: holdGetProjects.data[i].fields.name,
					project_key: holdGetProjects.data[i].projectKey,
					project_id: holdGetProjects.data[i].id
				};
			}
			console.log(holdProjects);
		}
	);
}

//return an object with testplan names and ids
function doTestPlanRequest() {
	request({
			url: getTestPlans,
			headers: {
				Authorization: auth
			}
		},
		function (error, response) {
			//need to find way to clear out object
			emptlyHoldTestPlans();
			holdTestplans.length = 0;
			var holdGetTestplans = JSON.parse(response.body);

			for (i = 0; i < holdGetTestplans.data.length; i++) {
				//populating object called holdTestplans -- which holds testplan_name and testplan_id
				holdTestplans[i] = {
					testplan_name: holdGetTestplans.data[i].fields.name,
					testplan_id: holdGetTestplans.data[i].id
				};
			}
			console.log('result from doTestPlanRequest:  ' + holdTestplans);
		}
	);
}

//return an object with testcycle names and ids
function doTestCycleRequest() {
	request({
			url: getTestCycles,
			headers: {
				Authorization: auth
			}
		},
		function (error, response, body) {
			emptlyHoldTestCycles();
			holdTestcycles.length = 0;
			var holdGetTestcycles = JSON.parse(response.body);

			for (i = 0; i < holdGetTestcycles.data.length; i++) {
				//populating object called hotTestcycles -- contains keys, testcycle_name and testcycle_id
				holdTestcycles[i] = {
					testcycle_name: holdGetTestcycles.data[i].fields.name,
					testcycle_id: holdGetTestcycles.data[i].id
				};
				//holdTestCyclesArray.push(holdTestcycles[i].testcycle_id);
			}
			console.log(holdTestcycles);
		}
	);
}

//return an object with testcycle names and ids
function doTestRunRequest() {
	console.log('-------------------------------------------------------------------------------------');
	console.log('doTestRunRequest() --- getTestRuns is: ' + getTestRuns);
	request({
			// url     : getTestRunsFunction(testCycleIdObj.idUpd, 0),
			url: getTestRuns,
			headers: {
				Authorization: auth
			}
		},
		function (error, response, body) {
			//clear out testruns from previous reqest
			emptlyHoldTestruns();

			holdTestRunStatusPassed = 0;
			holdTestRunStatusFailed = 0;
			holdTestRunStatusBlocked = 0;
			holdTestRunStatusNotrun = 0;
			console.log('holdGetTestruns are: ' + holdGetTestruns);
			//holds all the various cycles for the selected testplan
			holdGetTestruns = JSON.parse(response.body);

			//returns amound of test runs for selected test cycle
			console.log('returned test runs:  ' + holdGetTestruns.data.length);

			for (i = 0; i < holdGetTestruns.data.length; i++) {
				holdTestruns[i] = {
					testrun_name: holdGetTestruns.data[i].fields.name,
					testrun_id: holdGetTestruns.data[i].id,
					testrun_status: holdGetTestruns.data[i].fields.testRunStatus
				};
				if (holdGetTestruns.data[i].fields.testRunStatus == 'PASSED') {
					holdTestRunStatusPassed += 1;
				} else if (holdGetTestruns.data[i].fields.testRunStatus == 'FAILED') {
					holdTestRunStatusFailed += 1;
				} else if (holdGetTestruns.data[i].fields.testRunStatus == 'BLOCKED') {
					holdTestRunStatusBlocked += 1;
				} else if (holdGetTestruns.data[i].fields.testRunStatus == 'NOT_RUN') {
					holdTestRunStatusNotrun += 1;
				}
				//"Not Run" and "In Progress" options...
			}
			//
			console.log(holdTestruns);
			//testResults();
		}
	);

	console.log('-------------------------------------------------------------------------------------');
}

function testResults() {
	console.log('Testrun Status Passed: ' + holdTestRunStatusPassed);
	console.log('Testrun Status Failed: ' + holdTestRunStatusFailed);
	console.log('Testrun Status Blocked: ' + holdTestRunStatusBlocked);
	console.log('Testrun Status Not Run: ' + holdTestRunStatusNotrun);
}

app.listen(PORT, () => {
	console.log('app now listening to requests on 3000');
});