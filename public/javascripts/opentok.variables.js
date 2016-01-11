var apiKey = '45462192',
	sessionId = '1_MX40NTQ2MjE5Mn5-MTQ1MjQ3MTM2NDcyM35ybW4vRlMxbDZIVmF4RWhzT3Z0VmFhL0x-UH4',
	token = 'T1==cGFydG5lcl9pZD00NTQ2MjE5MiZzaWc9ZTE4YTAwZTFiMTcyZjU2Y2ZlNzlmYzFjYTFmYmZlNjczMDMyMGI2MDpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5UUTJNakU1TW41LU1UUTFNalEzTVRNMk5EY3lNMzV5Ylc0dlJsTXhiRFpJVm1GNFJXaHpUM1owVm1GaEwweC1VSDQmY3JlYXRlX3RpbWU9MTQ1MjQ3MTY5MSZub25jZT0wLjU3MTM3NzQ4NDA5NDI1NjcmZXhwaXJlX3RpbWU9MTQ1MjU1ODA5MQ==',
	session = OT.initSession(apiKey, sessionId);
session.on({ 
  streamCreated: function(event) { 
    session.subscribe(event.stream, 'subscribersDiv', {insertMode: 'append'}); 
  } 
}); 
session.connect(token, function(error) {
if (error) {
  console.log(error.message);
} else {
  session.publish('myPublisherDiv', {width: 320, height: 240}); 
}
});