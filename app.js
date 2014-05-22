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

var routes = require('./routes');
var users = require('./routes/user');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


app.get("/categories", sendRequestToSite, parseRequest, function(req, res){
  res.end("Hello there!");
});

function sendRequestToSite (req, res, next){
  res.write("Hey there from middleware one!\n");

  request('http://www.ems.com/',
          function(error, response, body){
            if (!error && response.statusCode === 200){
              req.body = body;
            }else{
              console.log("error: " + error + " response: " + response.statusCode);
            }
            next();
          });

}

function parseRequest(req, res, next){
  res.write("Hey there from middleware two!\n");
  if (req.body){
    $ = cheerio.load(req.body);
    var retval = {};
    var index = 0;
    retval.title = $("title").text();
    var length = $("#nav1").children().length;
    $("#nav1").children().each(function(index){
      var categoryTitle = $(this).find("span").first().text();
      var urlString = $(this).find("a").first().attr('href');
      var id = url.parse(urlString).query.split("=")[1];
      var href = "/categories/" + id; 

      if (!retval.categories){
        retval.categories = [];
      }
      retval.categories.push(new Category(href, id, categoryTitle));
      if (index+1 === length){
        res.write(JSON.stringify(retval, {}, "\t"));
        console.log(retval);
      }
    });
    
  };
  if (next){
    next();
  }
}

var Category = function(href, id, title){
  this.href = href;
  this.id = id;
  this.title = title;
}


var port = 8080;
app.listen(port);
console.log("server is listening on port: " + port);

