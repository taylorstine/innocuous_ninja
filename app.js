var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var routes = require('./routes');
var users = require('./routes/user');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


app.get("/", sendRequestToSite, middleTwo, function(req, res){
  res.end("Hello there!");
});

function sendRequestToSite (req, res, next){
  res.write("Hey there from middleware one!\n");
  request('http://www.google.com', function(error, response, body){
    if (!error && response.statusCode === 200){
      res.write(body);
    }else{
      console.log("error: " + error + " response: " + response.statusCode);
    }
    next();
  });
}

function middleTwo(req, res, next){
  res.write("Hey there from middleware two!\n");
  if (req.data){
    console.log("request data: " + req.data);
  }
  if (next){
    next();
  }
}
var port = 8080;
app.listen(port);
console.log("server is listening on port: " + port);

