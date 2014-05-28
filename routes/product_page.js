var request = require('request');

module.exports = function(req, res, next){
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
