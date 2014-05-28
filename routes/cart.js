var request = require('request');
var jar = request.jar();

module.exports = function(req, res, next){
  var baseUrl = 'http://www.ems.com/cart/index.jsp'
  request({
    uri: baseUrl,
    jar: jar
    }, function(err, response, body){
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

