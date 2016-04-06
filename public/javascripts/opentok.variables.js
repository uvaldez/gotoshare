var apiKey = '45552512',
	sessionId = document.querySelector( "#opentokSessionId" ),
	token = document.querySelector( "#opentokToken" ),
	session = OT.initSession( apiKey, sessionId.value );

// we start with publisher covering all screen
$( ".publisher" ).css( {"width": "100%"} );
$( ".loading" ).show();

session.on({
  streamCreated: function( event ) {
  	// if there is not any subscriber already we add new stream
    if ( $( "#subscribersDiv" ).find( ".OT_subscriber" ).length == 0 ){
	    session.subscribe( event.stream, 'subscribersDiv',
	    	{ width: "100%", height: 400, insertMode: 'append'} );
	    $( ".publisher" ).css( {"width": "49%"} );
	    $( "#subscribersDiv" ).css( {"display": "inline-block"} );
    }
  },
  streamDestroyed: function(event){
  	// if user leaves the chat room, publisher will cover all screen again
	$( "#subscribersDiv" ).css( {"display": "none"} );
	$(".publisher" ).css( {"width":"100%"} );
  }
});

session.connect(token.value, function(error) {
	if ( error ) {
	  console.log( error.message );
	} else {
		$( ".publisher" ).css( {"display": "inline-block"} );
		$( ".loading" ).hide();
	  	session.publish( 'myPublisherDiv', {width: "100%", height: 400} );
	}
});
