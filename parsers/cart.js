var cheerio = require('cheerio');


module.exports = function(req, res, next){
  var retval = {};
  retval.products = [];
  if (req.body){
    $ = cheerio.load(req.body);
    console.log(req.body.match(/cartInfoRow/g));
    $(".cartInfoRow").each(function(index){
      console.log("cart index: " + index);
      var productTitle = $(this).find(".cartProductTitle").text();
      var productId = $(this).find("span:contains('Item#:')").text().split(':')[1].trim();
      var productHref = "/products/" + productId;
      var productImg = $(this).find('a[href*="product"] img').attr("src");
      var productPrice = $(this).find("td[align=right] b").text().trim();
      var descriptors = {};

      console.log($(this).find('tr td').children().get(1));
      /*$(this).find('tr td').eq(1).find('b').each(function(index){
        console.log("the text: " +  $(this).text());
      });*/
      
      if (!retval.products){
        retval.products = [];
      }
      retval.products.push(new Product(productHref, productId, productTitle, productPrice, productImg, descriptors));
    });
    console.log(retval);
    if (next){
      req.retval = retval;
      next();
    }
  }
}
