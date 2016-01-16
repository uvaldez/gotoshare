//user object each user has a unique id
var user = {
            uuid: null,
            subscribed: false
        };
//channel that will be used
channel = "agility";
//get UUID from pubnub
Rx.DOM.ready().subscribe(
    function(){//ready
        getUUID();
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

function getUUID(){
    var uuid = PUBNUB.uuid();
    // Store the UUID with the user.
    user.uuid = uuid;
}
dom = {};
dom.btnInput = document.querySelector("#btn-input");
//dom.btnChat = document.querySelector("#btn-chat");

inputStream = Rx.Observable.fromEvent(dom.btnInput,"keyup");
//btnSendStream = Rx.Observable.fromEvent(dom.btnChat,"click");

inputStream.subscribe(function(e){
    if(e.keyCode === 13) {sendMessage(dom.btnInput.value);}
});

/*btnSendStream.subscribe(function(){
    console.log(dom.btnChat.value.length);
    if(dom.btnChat.value.length > 0){
        sendMessage(dom.btnInput.value);
    }
});*/

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
function receiveMessage(message){
    // Check to make sure the message is not just being
    // echoed back.
    if (message.uuid === user.uuid){
        // This message has already been handled locally.
        return;
    }
    // Add the message to the chat log.
    appendMessage( message.message, false );
}

//Append the given message to the message log.
function appendMessage( message, isFromMe ){
     // If the message is form me (ie. the local user) then
    // add the appopriate class for visual distinction.
    if (isFromMe){
        $("div.msg_container_base").append(msg_sent_elem.replace("<p></p>","<p>" + message + "</p>"));}
    else{
        $("div.msg_container_base").append(msg_receive_elem.replace("<p></p>","<p>" + message + "</p>"));}
    // Creat the message item.

}

function subscribe(success){
    if(success){
        // Flag the user as subscribed.
        user.subscribed = true;}
    else{
        var messageItem =  $(".messages").html("<p>Error on subscribing to pubnub!!!</p>");
        console.log("Error");
    }
}

msg_sent_elem = "<div class='row msg_container base_sent'><div class='col-md-10 col-xs-10'><div class='messages msg_sent'><p></p><time datetime='2009-11-13T20:00'>Timothy • 51 min</time></div></div><div class='avatar'><img src='/images/avatar1.jpg' class='img-responsive'></div></div>";
msg_receive_elem = "<div class='row msg_container base_receive'><div class='avatar'><img src='/images/avatar1.jpg' class='img-responsive'></div><div class='col-md-10 col-xs-10'><div class='messages msg_receive'><p></p><time datetime='2009-11-13T20:00'>Timothy • 51 min</time></div></div></div>";