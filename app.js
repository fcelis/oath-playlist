const express = require('express');
const authRoutes = require('./routes/auth-routes');
const app = express();
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');


//set up view engine
app.set('view engine', 'ejs');

//connec t to mongodb
mongoose.connect(keys.mongodb.dbURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, () => {

    console.log('connected to mongodb');
});

//setup routes
app.use('/auth', authRoutes);


//set static dir for calling files directly
app.use(express.static(__dirname + '/'));

//create home route
app.get('/', (req, res) => {
    res.render('home');
});



app.listen(3000, () => {
    console.log('app now listening to requests on 3000');

})