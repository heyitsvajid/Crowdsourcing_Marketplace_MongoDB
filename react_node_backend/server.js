//node server
'use strict'
//importing dependencies…
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
//creating instances
var app = express();
var session = require('express-session');
var   mongodbStore = require('connect-mongo')(session);
var router = express.Router();


//For Client-Session
//  var session = require('client-sessions');
//  app.use(session({
//    cookieName: 'session',
//    secret: 'Lab1_Freelancer',
//    duration: 24 * 30 * 60 * 1000,    //setting the time for active session
//    activeDuration: 5 * 60 * 1000,
//    httpOnly: true,
//    secure: true,
//    ephemeral: true
//  }));


var mongoose = require('mongoose');
mongoose.connect('mongodb://root:root@ds221609.mlab.com:21609/freelancer', {poolSize: 10})
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('connected', function () {
  return console.log('Successfully connected to  MongoDB Database');
});
db.once('disconnected', function () {
  return console.error('Successfully disconnected from MongoDB Database');
});
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);
module.exports = autoIncrement; 

app.use(session({
  name: 'CMPE273 Lab2 Freelancer',
   store: new mongodbStore({
  mongooseConnection: mongoose.connection,
  touchAfter: 5 * 60 * 1000}), 
  secret: 'qwertyuiop123456789', 
  resave: false,
  saveUninitialized: false, 
  cookie: {maxAge: 24 * 30 * 60 * 1000}}));


  app.use(passport.initialize());
  app.use(passport.session());
  
  //set our port to either a predetermined port number if you have set 
//it up, or 3001
var port = process.env.API_PORT || 3001;

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});

//configuring body parser to look for body data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//To prevent errors from Cross Origin Resource Sharing
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  //and remove cacheing so we get the most recent comments
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

//initializing route and API
router.get('/', function (req, res) {
  res.json({ message: 'API Up and Running!' });
});

//Use our router configuration when we call /api
//app.use('/api', router);
// keeping routes separate
require('./app/routes/routes.js')(app);

//starts the server and listens for requests
app.listen(port, function () {
  console.log(`api running on port ${port}`);
});


