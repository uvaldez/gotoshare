var apiKey = '45462192',
	sessionId = document.querySelector("#opentokSessionId"),
	token = document.querySelector("#opentokToken"),
	session = OT.initSession(apiKey, sessionId.value);
$(".publisher").css({"width":"100%"});
$(".loading").show();
session.on({ 
  streamCreated: function(event) {
    if ( $("#subscribersDiv").find(".OT_subscriber").length == 0){
	    session.subscribe(event.stream, 'subscribersDiv', {width: "100%", height: 400, insertMode: 'append'});
	    $(".publisher").css({"width":"49%"}); 
	    $("#subscribersDiv").css({"display":"inline-block"});
    }
  },
  streamDestroyed: function(event){
	$("#subscribersDiv").css({"display":"none"});
	$(".publisher").css({"width":"100%"});
  }
});
/*session.connect(token.value, function(error) {
	if (error) {
	  console.log(error.message);
	} else {
		$(".publisher").css({"display":"inline-block"});
		$(".loading").hide();
	  	session.publish('myPublisherDiv', {width: "100%", height: 400}); 
	}
});*/