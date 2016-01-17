var express = require('express');
var router = express.Router();
var actors = require('simple-actors');
var actor1, actor2;
var OpenTok = require('opentok');
rooms = [];
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' }); 
});

router.get('/start/:room', function(req, res, next) {
	var apiKey = '45462192',
		apiSecret = 'bb2477020e3ab230ce9b33b2fc8051807bd3dbcd',
		opentok = new OpenTok(apiKey, apiSecret),
		params = {};
		params.room = req.params.room;

	//first we add the room to rooms aray
	if(rooms.indexOf(params.room) < 0){
		rooms.push(params.room);
		createSession(opentok,params.room);
	}
	else{
		params.opentokToken = rooms[params.room].token;
		params.opentokSessionId = rooms[params.room].sessionId;
		res.render('start', { params: params });
	}

	// Create a session that will attempt to transmit streams directly between
	// clients. If clients cannot connect, the session uses the OpenTok TURN server:
	function createSession(opentok,room){
		opentok.createSession(function(err, session) {
			  	if (err) return console.log(err);
				params.opentokToken = session.generateToken({
							 			role :       'moderator',
							  			expireTime : (new Date().getTime() / 1000)+(7 * 24 * 60 * 60), // in one week
							  			data :       'name='+params.room
									});
			  	// save the sessionId
			  	params.opentokSessionId = session.sessionId;
			  	rooms[room] = {
			  		token : params.opentokToken,
			  		sessionId : params.opentokSessionId
			  	};
		  		res.render('start', { params: params });
			});
		return;
	}

});

router.get('/start', function(req, res, next) {
  res.redirect('/');
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

router.get('/start/test',function(req, res, next){
	res.render('test');
});
module.exports = router;
