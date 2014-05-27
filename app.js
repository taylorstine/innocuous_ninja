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
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(req.retval, {}, '\t'));
});

app.get("/categories/:id", sendRequestToCategories, parseCategoryRequest, function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(req.retval, {}, '\t')); 
});

app.get('/categories/:id/products', sendRequestToProducts, parseProductRequest, function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(req.retval, {}, '\t'));
});

app.get('/products/:id', sendRequestToProductPage, parseProductPageRequest, function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(req.retval, {}, '\t'));
});

app.get('/cart', sendRequestToCart, parseCartRequest, function(req, res){
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(req.retval, {}, '\t'));
});

app.post('/cart');

function sendRequestToCart(req, res, next){
  var baseUrl = 'http://www.ems.com/cart/index.jsp'
  request(baseUrl, function(err, response, body){
    if (!err && response.statusCode === 200){
      req.body = body;
      if (next){
        next();
      }
    }else{
      console.log("error: " + error + "response: " + response.statusCode);
    }
  });
}

function parseCartRequest(req, res, next){
  var retval = {};
  retval.products = [];
  if (req.body){
    $ = cheerio.load(req.body);
    console.log($("tr.cartInfoRow"))
    $("tr.cartInfoRow").each(function(index){
      var productTitle = $(this).find(".cartProductTitle").text();
      var productId = $(this).find("a[href~=product").split("=")[1];
      var productHref = "/products/" + productId;
      var productImg = $(this).find("a[href~=product] img").attr("src");
      var productPrice = $(this).find("td[align=right b").text();
      if (!retval.products){
        retval.products = [];
      }
      retval.products.push(new Product(productHref, productId, productTitle, productPrice, productImg));
    });
    if (next){
      req.retval = retval;
      next();
    }
  }
}


function sendRequestToProductPage(req, res, next){
  var baseUrl = 'http://www.ems.com/product/index.jsp?productId=' + req.params.id;
  request(baseUrl, function(err, response, body){
    if (!err && response.statusCode === 200){
      req.body = body;
      if(next){
        next();
      }
    }else{
      console.log("Error: " + err + " response status: " + response.statusCode);
    }
  });
}

function parseProductPageRequest(req, res, next){
  if (req.body){
    $ = cheerio.load(req.body);
    var retval = {};
    retval.variations = [];
    var jsonString = $('[language=javascript]').first().text().split("=")[1].trim();
    console.log(jsonString);
    var variations = JSON.parse(jsonString);
    console.log(variations);
    
    retval.forms = {};
    retval.forms.add_to_cart = {};
    var form = retval.forms.add_to_cart;
    form.method = $("form[name=orderFormProd]").attr('method');
    console.log(form.method);
    $("form[name=orderFormProd] input").each(function(index){
      var name = $(this).attr('name');
      var value = $(this).attr('value');
      console.log("name: %s, value: %s", name, value);
      if (name){
        console.log("valid name: " + name);
        form[name] = value;
      }
    });
    req.retval = retval;
    if (next){
      next();
    }
  }
}


function sendRequestToProducts(req, res, next){
  if (req.params.id){
    var baseUrl = "http://www.ems.com/family/index.jsp?categoryId=" + req.params.id;
    request(baseUrl, function(err, response, body){
      if (!err && response.statusCode === 200){
        req.body = body;
        if (next){
          next();
        }
      }else{
        console.log("error: " + error + " response: " + response.statusCode);
      }
    });
  }
}

function parseProductRequest(req, res, next){
  if (req.body){
    var $ = cheerio.load(req.body);
    var retval = {};
    $("#contentColumn .productItem").each(function(index){
      var productTitle = $(this).find("a").attr('title'); 
      var productImg = $(this).find("a img.productImage").attr("src");
      var productPrice = $(this).find(".price-list span").text();
      var productId = $(this).find("a").attr("href").split("=")[1];
      var productHref = "/products/" + productId;

      var productForm = {};
      productForm.add_to_cart = {};
      $("form.OrderFormProd input").each(function(index){
        $(this).find("input").each(function(index){
          console.log($(this).attr("name"));
        });
      });
      
      if (!retval.products){
        retval.products = [];
      }
      retval.products.push(new Product(productHref, productId, productTitle, productPrice, productImg));
    });
    if (next){
      req.retval = retval;
      next();
    }
  }
}
        
function sendRequestToCategories(req, res, next){
  if (req.params.id){
    var baseUrl = "http://www.ems.com/category/index.jsp?categoryId=" + req.params.id;
    request(baseUrl, function(err, response, body){
      if (!err && response.statusCode === 200){
        req.body = body;
        if (next){
          next();
        }
      }else{
        console.log("error: " + error + " response: " + response.statusCode);
      }
    });
  }
}

function parseCategoryRequest(req, res, next){
  if (req.body){
    var retval = {};
    $ = cheerio.load(req.body);
    retval.title = $("title").text();
    var size = $("#contentColumn ul").length;
    $("#contentColumn ul").each(function(index){
      var categoryTitle = $(this).find(".title a").text();
      var categoryId = $(this).find(".title a").attr("href").split("=")[1];
      var categoryHref = '/categories/' + categoryId + '/products';
      if (!retval.categories){
        retval.categories = []
      }
      retval.categories.push(new Category(categoryHref, categoryId, categoryTitle));
    });
    req.retval = retval;
    next();
  }else{
    console.log("no body");
  }
}

function sendRequestToSite (req, res, next){
  request('http://www.ems.com/', function(error, response, body){
    if (!error && response.statusCode === 200){
      req.body = body;
      next();
    }else{
      console.log("error: " + error + " response: " + response.statusCode);
    }

  });

}

function parseRequest(req, res, next){
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
    });
  };
  if (next){
    req.retval = retval;
    next();
  }
}

var Category = function(href, id, title){
  this.href = href;
  this.id = id;
  this.title = title;
}

var Product = function(href, id, title, price, image){
  this.href = href;
  this.id = id;
  this.title = title;
  this.price = price;
  this.image = image;
}


var port = 8080;
app.listen(port);
console.log("server is listening on port: " + port);

