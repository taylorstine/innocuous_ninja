var request = require('request');

request('http://www.ems.com/home/index.jsp', function(err, response, body){
  if (!err && response.statusCode === 200){
    console.log(body);
  }
});
