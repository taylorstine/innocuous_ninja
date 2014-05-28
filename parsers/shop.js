var cheerio = require('cheerio');

module.exports = function(req, res, next){
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

var Product = function(href, id, title, price, image, descriptors){
  this.href = href;
  this.id = id;
  this.title = title;
  this.price = price;
  this.image = image;
  if (descriptors){
    for (val in descriptors){
      this[val] = descriptors[val];
    }
  }
}
