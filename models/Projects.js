const mongoose = require('mongoose');

//schema - describe how you data is/looks -- saving name of projects received
const ProjectsSchema = mongoose.Schema({
    name: {
        type: String
    },
    id: {
        type: Number
    },
    resultCount: {
        type: Number
    },
    date: {
        type: Date
    },
    data: [new mongoose.Schema({
        _id: false,
        name: {
            type: String
        },
        id: {
            type: Number
        }
    }, {
        strict: false
    })]
}, {
    strict: false
});

module.exports = mongoose.model('Projects', ProjectsSchema);