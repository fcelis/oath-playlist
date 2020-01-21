const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');


passport.use(new GoogleStrategy({
    //options for the google strategy
    callbackURL: '/auth/google/redirect',
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret
}, () => {
    console.log('pp fired');
}))

// (accessToken, refreshToken, profile, done) => {
//     // callback function -- passport
//     console.log('passport callback function fired');
//     console.log(profile);
// }
