var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req)
  res.send('respond : register');
});

module.exports = router;
