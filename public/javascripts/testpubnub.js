//user object each user has a unique id
var user = {
            uuid: null,
            subscribed: false
        };

// Cache frequent DOM references.
dom = {};
dom.messageLog = $("div.messageLog");
dom.messageLogItems = dom.messageLog.find("> ul");
dom.form = $("form");
dom.formInput = dom.form.find("input");
dom.formSubmit = dom.form.find( "button" );

//channel that will be used
channel = "agility";

//Subscribe to submit event
var formSubmit = Rx.Observable.fromEvent(dom.form,'submit');

formSubmit.subscribe(function(e) {
    e.preventDefault();
    //first we check if user is subscribe to any channel
    if (!user.subscribed || !dom.formInput.val().length){return;}
    
    sendMessage(dom.formInput.val());
    // Clear and focus the current message so the
    // user can keep typing new messages.
    dom.formInput.val("").focus();
});

//get UUID from pubnub
Rx.DOM.ready().subscribe(
    function(){//ready
        getUUIDP();
    },
    function(err){//on error
        console.log(err);
    },
    function(){//when completed
        PUBNUB.subscribe({
            channel: channel,
            callback: receiveMessage,
            connect: subscribe(true),
            error: subscribe(false)
        });
    }
);


function subscribe(success){
    if(success){
        // Flag the user as subscribed.
        user.subscribed = true;
        // Enable the message form.
        dom.formSubmit.removeAttr( "disabled" );}
    else{
        var messageItem = $("<li/>").text("Error on subscribing to pubnub!!!");
        messageItem.addClass( "error" );    
        dom.messageLogItems.append();
    }
}

       
        //Append the given message to the message log.
        function appendMessage( message, isFromMe ){
            // Creat the message item.
            var messageItem = $("<li/>").text(message);
            // If the message is form me (ie. the local user) then
            // add the appopriate class for visual distinction.
            if (isFromMe){ messageItem.addClass( "mine" ); }
            // Add the message element to the list.
            dom.messageLogItems.append( messageItem );
        }
        // I send the given message to all subscribed clients.
        function sendMessage( message ){
            // Immediately add the message to the UI so the user
            // feels like the interface is super responsive.
            appendMessage( message, true );
            // Push the message to PubNub. Attach the user UUID as
            // part of the message so we can filter it out when it
            // gets echoed back (as part of our subscription).
            PUBNUB.publish({
                channel: channel,
                message: {
                    uuid: user.uuid,
                    message: message
                }
            });
        };
        // I receive the message on the current channel.
        function receiveMessage( message ){
            // Check to make sure the message is not just being
            // echoed back.
            if (message.uuid === user.uuid){
                // This message has already been handled locally.
                return;
            }
            // Add the message to the chat log.
            appendMessage( message.message );
        }

        function getUUIDP(){
            var uuid = PUBNUB.uuid();
            // Store the UUID with the user.
            user.uuid = uuid;
        }