var cheerio = require('cheerio');

module.exports = function(req, res, next){
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

var Category = function(href, id, title){
  this.href = href;
  this.id = id;
  this.title = title;
}
