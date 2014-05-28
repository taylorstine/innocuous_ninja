var cheerio = require('cheerio');

module.exports = function(req, res, next){
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

