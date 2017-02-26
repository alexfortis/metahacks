// App configuration
var express = require('express');
var favicon = require('serve-favicon');
var marked = require('marked');
var util = require('util');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var moment = require('moment');
moment().format();
var app = express();
app.set('view engine', 'pug');
const path = require('path');

// Use moment library on Pug variables
app.locals.moment = require('moment');
app.locals.title = "Hackathon Simulator";

// Set up Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/hackathon-simulator');
mongoose.Promise = require('bluebird');

// Set up session
app.use(require('express-session')({
    key: 'session',
    secret: process.env.HACKATHON_SIMULATOR_SECRET,
    store: require('mongoose-session')(mongoose)
}));

// Event Schema
var EventChanceSchema = new Schema({
    message: String,
    start: Boolean,
    name: {
        type: String,
        unique: true,
        sparse: true
    },
    choices: [{
        text: String,
        next: String,
        effects: Object
    }],
    chances: [Schema.Types.Mixed],
    image: String
});

EventChanceSchema.statics.random = function(callback) {
  this.count(function(err, count) {
    if (err) {
      return callback(err);
    }
    var rand = Math.floor(Math.random() * count);
    this.findOne().skip(rand).exec(callback);
  }.bind(this));
};

var Event = mongoose.model('Event', EventChanceSchema, 'events');
var Chance = mongoose.model('Chance', EventChanceSchema, 'chances');

// Path configuration
const dir = path.resolve(__dirname, '..');
app.use(favicon(dir + '/public/favicon.ico'));
app.use('/public', express.static(dir + '/public/'));
app.use('/semantic', express.static(dir + '/node_modules/semantic-ui/dist/'));
app.use('/jquery', express.static(dir + '/node_modules/jquery/dist/'));
app.use('/moment', express.static(dir + '/node_modules/moment/min/'));
app.use('/assets', express.static(dir + '/assets/'));
app.use(function(req, res, next) {
    var pathStr = req.path;
    if (req.path.length != 1 && req.path.substr(-1) == "/") pathStr = req.path.substring(0, req.path.length - 1);
    res.locals = {
        path: pathStr
    }
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

// Routes
require('../routes/general')(app, Event, Chance);

// Port configuration
const port = 3000;

app.listen(port, function() {
    console.log('Running on localhost:' + port);
});