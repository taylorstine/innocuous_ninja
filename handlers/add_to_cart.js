var url = require('url');
var request = require('request');
var jar = request.jar();

module.exports = function (req, res, next){
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
    form: form,
    followAllRedirect: true,
    jar: jar
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

