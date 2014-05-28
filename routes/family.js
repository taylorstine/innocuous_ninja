var request = require('request');

module.exports = function (req, res, next){
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
