const
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('../models/users');

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
   passReqToCallback: true
},
  function(req, email, password, done) {
    User.findOne({ email: email }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, req.flash('warning', 'User not found'));
      }
      if (!user.comparePass(password)) {
        return done(null, false, req.flash('warning', 'Incorrect password.' ));
      }
      if(user.active === false) {
        return done(null, false, req.flash('danger', 'User profile is in-active'));
      }
      return done(null, user);
    });
  }
));