const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(User.createStrategy());

//pass in user object
//on request, will ask passport what to do with user, now that they are confirmed
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

