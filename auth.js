var express = require('express')
  , path = require('path')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')  
  , passport = require('passport')
  , util = require('util')
  , OutlookStrategy = require('passport-outlook').Strategy;

var OUTLOOK_CLIENT_ID = "69cc8899-16f8-415c-91da-1ddc110a322a";
var OUTLOOK_CLIENT_SECRET = "Yq96XFCGLa0KPVhGM5DkU554C1-K~_c15_";


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Outlook profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the OutlookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Outlook
//   profile), and invoke a callback with a user object.
passport.use(new OutlookStrategy({
    clientID: OUTLOOK_CLIENT_ID,
    clientSecret: OUTLOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/outlook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Outlook profile is returned
      // to represent the logged-in user.  In a typical application, you would
      // want to associate the Outlook account with a user record in your
      // database, and return that user instead.
      return done(null, profile);
    });
  }
));


var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/outlook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Outlook authentication will involve
//   redirecting the user to outlook.com.  After authorization, Outlook
//   will redirect the user back to this application at
//   /auth/outlook/callback
app.get('/auth/outlook',
  passport.authenticate('windowslive', { scope: [
    'openid',
    'profile',
    'offline_access',
    'https://outlook.office.com/Mail.Read'
  ] }),
  function(req, res){
    // The request will be redirected to Outlook for authentication, so
    // this function will not be called.
  });

// GET /auth/outlook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/outlook/callback', 
  passport.authenticate('windowslive', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}