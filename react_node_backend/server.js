//node server
'use strict'
//importing dependencies…
var express = require('express');
var bodyParser = require('body-parser');
//creating instances
var app = express();
var router = express.Router();
//For Client-Session

 var session = require('client-sessions');
 app.use(session({
   cookieName: 'session',
   secret: 'Lab1_Freelancer',
   duration: 24 * 30 * 60 * 1000,    //setting the time for active session
   activeDuration: 5 * 60 * 1000,
   httpOnly: true,
   secure: true,
   ephemeral: true
 }));


var mongoose = require('mongoose');
mongoose.connect('mongodb://root:root@ds221609.mlab.com:21609/freelancer', {poolSize: 1000})
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);
module.exports = autoIncrement; 



//set our port to either a predetermined port number if you have set 
//it up, or 3001
var port = process.env.API_PORT || 3001;

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

router.route('/comments')
  //retrieve all comments from the database
  .get(function(req, res) {
    //looks at our Comment Schema
    Comment.find(function(err, comments) {
      if (err)
        res.send(err);
      //responds with a json object of our database comments.
      res.json(comments)
    });
  })
  //post new comment to the database
  .post(function(req, res) {
    var comment = new Comment();
    (req.body.author) ? comment.author = req.body.author : null;
    (req.body.text) ? comment.text = req.body.text : null;

    comment.save(function(err) {
      if (err)
        res.send(err);
      res.json({ message: 'Comment successfully added!' });
    });
  })

//Use our router configuration when we call /api
//app.use('/api', router);
// keeping routes separate
require('./app/routes/routes.js')(app);

//starts the server and listens for requests
app.listen(port, function () {
  console.log(`api running on port ${port}`);
});


