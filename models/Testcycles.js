const mongoose = require('mongoose');

//schema - describe how you data is/looks -- saving name of testcycles received
const TestcylesSchema = mongoose.Schema({
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
        Name: {
            type: String
        },
        Text: {
            type: Number
        }
    }, {
        strict: false
    })]
}, {
    strict: false
});

module.exports = mongoose.model('Testcycles', TestcyclesSchema);