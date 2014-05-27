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

app.post('/cart', handleCartPost,  function(req, res){
  res.setHeader('Content-Type', 'application/json');
  if (req.retval){
    res.end(JSON.stringify(req.retval, {}, '\t'));
  }else{
    res.end()
  }
});



function handleCartPost(req, res, next){
  var baseUrl = 'http://www.ems.com/cartHandler/index.jsp';
  console.log(url.parse(baseUrl));
  var form = {};
  form.action = req.param('action') || 'skuAddToCart';
  form.async = false;
  form.wlName = req.param('wlName') || '';
  form.expressCheckout = req.param('expressCheckout') || '';
  form.prod_0 = req.param('prod_0') || '';
  form.qty_0 = parseInt(req.param('qty_0')) || 0;
  
  request.post( {
    uri: baseUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: form
  },
                function(err, response, body){
                  console.log('body: ' + baseUrl);
                  console.log('body: ' + body);
                  console.log('response: ' + response);
                  console.log('error: ' + err);

                  res.redirect('/cart');
                  /*if (!err && response.statusCode === 200){
                    res.redirect('/cart');
                    }else{
                    console.log("error: " + err + "response: " + response.statusCode);
                    }*/
                });
}


function sendRequestToCart(req, res, next){
  var baseUrl = 'http://www.ems.com/cart/index.jsp'
  request(baseUrl, function(err, response, body){
    if (!err && response.statusCode === 200){
      req.body = body;
      if (next){
        next();
      }
    }else{
      console.log("error: " + err + "response: " + response.statusCode);
    }
  });
}

function parseCartRequest(req, res, next){
  var retval = {};
  retval.products = [];
  if (req.body){
    $ = cheerio.load(req.body);
    console.log(req.body.match(/cartInfoRow/g));
    $(".cartInfoRow").each(function(index){
      console.log("cart index: " + index);
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
    console.log(retval);
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

    retval.sku = $('.itemNumber').text().split(':')[1].trim();
    
    var form = {};
    $("form[name=orderFormProd] input").each(function(index){
      var name = $(this).attr('name');
      var value = $(this).attr('value');
      if (name){
        form[name] = value;
      }
    });
    
    retval.variations = [];
    var jsonString = $('[language=javascript]').first().text().split("=")[1].trim();
    eval("var productsObj = " + jsonString);
    if (productsObj) {
      var skus = productsObj.skus;
      for (var idx = 0; idx < skus.length; idx+=1){
        
        retval.variations.push({});
        var variation = retval.variations[idx];
        
        variation.size = skus[idx].size;
        variation.color = skus[idx].color;
        variation.availability = skus[idx].avail;
        variation.price = skus[idx].price;
        
        variation.forms = {};
        variation.forms.add_to_cart = {};
        for (value in form){
          if (value.toString().match(/prod/g)){
            variation.forms.add_to_cart[value] = retval.sku + '|' + skus[idx].sku_id;
          }else{
            variation.forms.add_to_cart[value] = form[value];
          }            
        }
        variation.forms.add_to_cart.method = $("form[name=orderFormProd]").attr('method');
      }
    }

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

