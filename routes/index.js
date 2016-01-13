var express = require('express');
var router = express.Router();
var actors = require('simple-actors');
var actor1, actor2;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/start', function(req, res, next) {
	console.log(req.body.roomName);

  res.render('start', { roomName: req.body.roomName });
});

router.get('/start/actor1',function(req, res, next){
	    actor1 = new actors.Actor('actor1');
	 
	var bus = new actors.LocalMessageBus();
	
	 
	// actor1 listens for messages containing 'hi' or 'hello' (case insensitive) 
	actor1.on(/./, function (from, message) {
	  console.log(from + ' said: ' + message);
	 
	  // reply to the greeting 
	  this.send(from, 'Hi ' + from + ', nice to meet you!');
	});
	 
	//console.log(actors);
	res.send(200);
});

router.get('/start/actor2',function(req, res, next){
    actor2 = new actors.Actor('actor2');
    
	 var bus = new actors.LocalMessageBus();

	actor1.connect(bus);
	actor2.connect(bus);
	 //console.log(bus.peers['actor1']);==>this returns undefined if peer doesnt exists
	 
	// actor2 listens for any message 
	actor2.on(/./, function (from, message) {
	  console.log(from + ' said: ' + message);
	});
	 
	// send a message to actor 1 
	actor2.send('actor1', 'Hello actor1!');	
	//console.log(actors);
	res.send(200);
});
module.exports = router;
