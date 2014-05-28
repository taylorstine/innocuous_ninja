var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require("cheerio");
var _ = require("lodash-node");
var url = require('url');
var escape = require('escape-html');
var jar = request.jar();

var routes = require('./routes');
var parsers = require('./parsers');
var handlers = require('./handlers');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


app.get("/categories", routes.categories, parsers.categories, function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(req.retval, {}, '\t'));
});

app.get("/categories/:id", routes.family, parsers.family, function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(req.retval, {}, '\t')); 
});

app.get('/categories/:id/products', routes.shop, parsers.shop, function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(req.retval, {}, '\t'));
});

app.get('/products/:id', routes.product_page, parsers.product_page, function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(req.retval, {}, '\t'));
});

app.get('/cart', routes.cart, parsers.cart, function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(req.retval, {}, '\t'));
});

app.post('/cart', handlers.add_to_cart,  function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if (req.retval){
    res.end(JSON.stringify(req.retval, {}, '\t'));
  }else{
    res.end()
  }
});


var port = 8080;
app.listen(port);
console.log("server is listening on port: " + port);
