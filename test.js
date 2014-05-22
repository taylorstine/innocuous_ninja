var request = require('request');

request('http://www.google.com', function(err, response, body){
  if (!err && response.statusCode === 200){
    console.log(body);
  }
});
