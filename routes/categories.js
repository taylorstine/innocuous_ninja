var request = require('request');

module.exports = function (req, res, next){
  request('http://www.ems.com/', function(error, response, body){
    if (!error && response.statusCode === 200){
      req.body = body;
      next();
    }else{
      console.log("error: " + error + " response: " + response.statusCode);
    }

  });
}
