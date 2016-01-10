var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/start', function(req, res, next) {
	console.log(req.body.roomName);
  res.render('start', { roomName: req.body.roomName });
});


module.exports = router;
