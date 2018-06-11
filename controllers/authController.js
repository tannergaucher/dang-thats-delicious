const passport = require('passport');

//strategy: sth that will interface with checking if youre allowed to be logged in

//create a middleware
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
}); 

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out.');
  res.redirect('./');
}