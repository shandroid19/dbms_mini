var express = require('express');
var router = express.Router();





  router.route('/')
  
  .get(function(req, res, next) {
    res.render('index', { title: 'Express' });


  });



/* GET home page. */


module.exports = router;
