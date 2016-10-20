var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var util = require('util');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
global.__base = __dirname;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// dynamic Helper
app.locals = {
  user: function (req, res) {
    return req.session.user;
  },
  error: function (req, res) {
    var err = req.session.error;
    if (err){
      console.log('===============' + JSON.stringify(err));
      return err;
    }
    else
      return null;
  },
  success: function (req, res) {
    var succ = req.session.success;
    if (succ){
      return succ;
    }
    else
      return null;
  }
};

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(partials());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: settings.cookieSecret,
  store: new MongoStore({
    url: 'mongodb://localhost/' + settings.db
  })
}));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
