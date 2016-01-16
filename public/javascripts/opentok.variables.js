var apiKey = '45462192',
	sessionId = '1_MX40NTQ2MjE5Mn5-MTQ1MjU2MTA0MzIwN35qdUhzWjFMUW5hNzJ5S2wrdkgxSGNRRXh-UH4',
	token = 'T1==cGFydG5lcl9pZD00NTQ2MjE5MiZzaWc9YTQ4ZjRmOTMzYjk2YzBmN2RjY2RjNTZlYTY0ZmQ5MjlhNDBhYTI5Yzpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5UUTJNakU1TW41LU1UUTFNalUyTVRBME16SXdOMzVxZFVoeldqRk1VVzVoTnpKNVMyd3Jka2d4U0dOUlJYaC1VSDQmY3JlYXRlX3RpbWU9MTQ1MjU2MTA3NiZub25jZT0wLjY2ODE3MTg3NjU1NDY5NzkmZXhwaXJlX3RpbWU9MTQ1NTE1Mjg5OSZjb25uZWN0aW9uX2RhdGE9',
	session = OT.initSession(apiKey, sessionId);
session.on({ 
  streamCreated: function(event) { 
    session.subscribe(event.stream, 'subscribersDiv', {insertMode: 'append'}); 
  } 
});
/*	session.connect(token, function(error) {
	if (error) {
	  console.log(error.message);
	} else {
	  session.publish('myPublisherDiv', {width: 320, height: 240}); 
	}
});*/