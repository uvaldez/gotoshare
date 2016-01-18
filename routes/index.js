var express = require('express');
var router = express.Router();
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

router.get('/clearRooms',function(req, res, next){
	rooms.length = 0;
	res.sendStatus(200);
})
module.exports = router;
