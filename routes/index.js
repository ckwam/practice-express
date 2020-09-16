var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' }); //-@#03
  res.render('index', { title: 'Express', user:req.user}); //+@#03
});

module.exports = router;
