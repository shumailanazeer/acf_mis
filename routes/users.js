const User = require('../models/users'),
      fs = require('fs');
      
const isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/signin')
  }
}

module.exports = function(app, passport) {
  app.get('/',isLoggedIn, (req, res)=>{
    res.render('pages/index');
  });
  app.route('/signup')
    .get((req, res) => {
      if (req.user) {
        res.redirect('/');
      } else {
        res.render('pages/signup');
      }
    })
    .post((req, res) => {
      var f_name = req.body.f_name,
          l_name = req.body.l_name,
        email = req.body.email,
        password = req.body.password;
        password2 = req.body.password2;
        req.checkBody('password2', 'Password not matched').custom((value) => value === password);

        var errors = req.validationErrors();

        if(errors) {
          console.log(errors)
          res.render('pages/signup', {errors: errors});
        } else {
          User.findOne({
            email: email
          }, (err, user) => {
            if (err) throw new Error(err);
            if (user) {
              req.flash('danger', 'User allready registered');
              res.render('pages/signup');
            } else {
              var newUser = new User();
              newUser.f_name = f_name;
              newUser.l_name = l_name;
              newUser.email = email;
              newUser.password = newUser.hashPass(password);
              newUser.save((err, user) => {
                if (err) throw new Error(err);
                req.flash('success', 'Successfully registered, Please login');
                res.redirect('/');
              });
            }
          });
        }
      
    });
  app.route('/signin')
    .get((req, res) => {
      if (req.user) {
        res.redirect('/');
      } else {
        res.render('pages/signin');
      }
    })
    .post(passport.authenticate('local-login', {
      successRedirect: '/',
      failureRedirect: '/signin'
    }));
  app.route('/profile')
    .get(isLoggedIn, (req, res) => {
      res.render('pages/profile')
    });
  app.route('/profile/:email')
    .get(isLoggedIn, (req, res) => {
      res.render('pages/updateUser')
    })
    .post(isLoggedIn, (req, res) => {
      User.findOne({
        email: req.params.email
      }, (err, user) => {
        var password = req.body.password,
          name = req.body.name;
        if (password) user.password = user.hashPass(password);
        if (email) user.email = email;
        user.save((err, newuser) => {
          if (err) throw new Error(err);
          res.redirect('/profile')
        });
      });
    });
  app.get('/logout',isLoggedIn, (req, res)=>{
    req.logout();
    req.flash('success', 'Successfully signed out');
    res.redirect('/signin');
  })
}