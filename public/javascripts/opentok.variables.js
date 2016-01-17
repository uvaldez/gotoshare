var apiKey = '45462192',
	apiSecret = 'bb2477020e3ab230ce9b33b2fc8051807bd3dbcd',
	sessionId = document.querySelector("#opentokSessionId"),
	token = document.querySelector("#opentokToken"),
	session = OT.initSession(apiKey, sessionId.value);
session.on({ 
  streamCreated: function(event) { 
    session.subscribe(event.stream, 'subscribersDiv', {insertMode: 'append'}); 
  } 
});
session.connect(token.value, function(error) {
	if (error) {
	  console.log(error.message);
	} else {
	  session.publish('myPublisherDiv', {width: 320, height: 240}); 
	}
});