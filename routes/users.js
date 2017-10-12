var express = require('express');
var router = express.Router();
var multer = require("multer");
var upload = multer({ dest: 'includes/'});

router.post('/',upload.any(), function(req,res,next){
  console.log(req.body, 'Body');
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users')
  //res.send('respond with a resource');
});

module.exports = router;
