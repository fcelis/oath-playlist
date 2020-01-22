const express = require('express');
const app = express();
const mongoose = require('mongoose');
const keys = require('./config/keys');

const bodyParser = require('body-parser');
const PORT = 3000;
const Project = require('./models/Projects');
const cors = require('cors');


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

app.use(express.static(__dirname + '/'));
app.use(bodyParser.json());
app.use(cors());

var username = keys.users.user;
var password = keys.users.password;

//get projects
app.get('/projects', async (req, res) => {
    try {
        const proj = await Project.find();

        res.render(JSON.parse(proj));
    } catch (err) {
        res.json({
            message: err
        });
    }
});


app.post('/projects', async (req, res) => {
    const proj = new Project({
        projectId: req.body.projectId,
        projectName: req.body.projectName
    });
    console.log('adding project');

    try {
        const savedProj = await proj.save();
        //res.type('json');
        res.json(savedProj);
    } catch (err) {
        res.send({
            message: err
        });
    }
});


app.listen(PORT, () => {
    console.log('app now listening to requests on 3000');
});