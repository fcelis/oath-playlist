const passport = require('passport');
const GoogleStrategy = require('passport-google-oath20');

passport.use(new GoogleStrategy({
    //options for the google strategy
}), () => {
    //callback function -- passport

})