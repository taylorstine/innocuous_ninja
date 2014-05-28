var cheerio = require('cheerio');
var url = require('url');

module.exports =  function(req, res, next){
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

