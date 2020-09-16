var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet'); //+@#02
/* +@#03 ここから */
var session = require('express-session');
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;

//テストなので
var GITHUB_CLIENT_ID = 'd9595519de78dbffdc69';
var GITHUB_CLIENT_SECRET = 'b625f4446d461c2d4e53ef8e6173c642e0c67397';

passport.serializeUser(function(user, done){
  done(null, user);
});
passport.deserializeUser(function(obj, done){
  done(null, obj);
});
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/github/callback'
},
  function(accessToken, refreshToken, profile, done){
    process.nextTick(function(){
      return done(null, profile);
    });
  }
));
/* +@#03 ここまで*/

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var photosRouter = require('./routes/photos'); //+@#02

var app = express();
app.use(helmet()); //+@#02

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//+@#03 秘密鍵を生成
app.use(session({ secret: 'ea90766078a7b114', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
//app.use('/users', usersRouter); //-@#03
app.use('/users', ensureAuthenticated, usersRouter); //+@#03
app.use('/photos', photosRouter); //+@#02

//+@#03
app.get('/auth/github',
  passport.authenticate('github', {scope: ['user:email']}),
  function(req, res){
});
app.get('/auth/github/callback',
  passport.authenticate('github', {failureRedirect: '/login'}),
  function(req, res){
    res.redirect('/');
});
app.get('/login', function(req, res){
  res.render('login'); //login.pugがあること
});
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
function ensureAuthenticated(req, res, next){
  if (req.isAuthenticated()) {return next();}
  res.redirect('/login');
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
