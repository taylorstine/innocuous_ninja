/* GET home page. */
exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
exports.categories = require('./categories.js');
exports.family = require('./family.js');
exports.shop = require('./shop.js');
exports.product_page = require('./product_page.js');
exports.cart = require('./cart.js');
