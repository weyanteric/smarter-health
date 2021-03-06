
var express = require('express')
  , env = process.env.NODE_ENV || 'production'
  , config = require('./config')[env]
  , passport = require('passport')
  , http = require('http')
  , path = require('path')
  , util = require('util')
  , mongoose = require('mongoose')
  , JawboneStrategy = require('passport-jawbone').Strategy
  , FitbitStrategy = require('passport-fitbit').Strategy;

var Schema = mongoose.Schema;

var FITBIT_CONSUMER_KEY = config.fitbitClientKey;  //"61b393fcee444af389dc08333aa66d1c";
var FITBIT_CONSUMER_SECRET = config.fitbitClientSecret;  //"545a8367dd894e8cb884a6621ff62128";

var JAWBONE_CONSUMER_KEY = config.jawboneClientKey; 
var JAWBONE_CONSUMER_SECRET = config.jawboneClientSecret;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Fitbit profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FitbitStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Fitbit profile), and
//   invoke a callback with a user object.
passport.use(new FitbitStrategy({
    consumerKey: FITBIT_CONSUMER_KEY,
    consumerSecret: FITBIT_CONSUMER_SECRET,
    callbackURL: "/auth/fitbit/callback"
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Fitbit profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Fitbit account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// Use the FitbitStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Fitbit profile), and
//   invoke a callback with a user object.
passport.use(new JawboneStrategy({
    consumerKey: JAWBONE_CONSUMER_KEY,
    consumerSecret: JAWBONE_CONSUMER_SECRET,
    callbackURL: "/auth/jawbone/callback"
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Fitbit profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Fitbit account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.cookieParser('healthsmartappisgreat'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

// Connect to database and initialize model
mongoose.connect(config.db);
require('./models/user');

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/fitbit
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Fitbit authentication will involve redirecting
//   the user to fitbit.com.  After authorization, Fitbit will redirect the user
//   back to this application at /auth/fitbit/callback
app.get('/auth/fitbit',
  passport.authenticate('fitbit'),
  function(req, res){
    // The request will be redirected to Fitbit for authentication, so this
    // function will not be called.
  });

// GET /auth/fitbit/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/fitbit/callback', 
  passport.authenticate('fitbit', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


// GET /auth/jawbone
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Jawbone authentication will involve redirecting
//   the user to jawbone.com.  After authorization, Jawbone will redirect the user
//   back to this application at /auth/jawbone/callback
app.get('/auth/jawbone',
  passport.authenticate('jawbone'),
  function(req, res){
    // The request will be redirected to Fitbit for authentication, so this
    // function will not be called.
  });

// GET /auth/fitbit/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/jawbone/callback', 
  passport.authenticate('jawbone', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function(){
  console.log("Listening on " + port);
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
