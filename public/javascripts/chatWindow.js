PUBNUB.init({
    publish_key: 'pub-c-17c0177d-d952-4745-a506-5019121be7f1',
    subscribe_key: 'sub-c-04342e80-bad1-11e5-8b32-02ee2ddab7fe'
  });

//user object each user has a unique id
var user = {
            uuid: null,
            name: "Guest",
            subscribed: false
        };
//channel that will be used
channel = document.querySelector("#channel").value;
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
            error: subscribe(false),
            presence: function(data){
                console.log(data);
            }
        });
    }
);

function getUUID(){
    var uuid = PUBNUB.uuid();
    // Store the UUID with the user.
    user.uuid = uuid;
    user.name = document.querySelector("#user_name").value.replace(" ","-");
}
dom = {};
dom.btnInput = document.querySelector("#btn-input");
dom.btnChat = document.querySelector("#btn-chat");
dom.btnUserName = document.querySelector("#btn-username");
dom.btnApplyUserName = document.querySelector("#apply");
dom.download =  document.querySelector("#filecompleted");
dom.downloadAnchor = document.querySelector('a#download');
btnApplyClickStream = Rx.Observable.fromEvent(dom.btnApplyUserName,"click");
inputStream = Rx.Observable.fromEvent(dom.btnInput,"keyup");
btnSendStream = Rx.Observable.fromEvent(dom.btnChat,"click");
btnUserNameStream = Rx.Observable.fromEvent(dom.btnUserName,"keyup");
downloadChangeStream = Rx.Observable.fromEvent(dom.download,"click");
downloadChangeStream.subscribe(function(){
    downloadLink = dom.downloadAnchor.href + "," + downloadAnchor.download + "," + downloadAnchor.textContent;
    message = { 'link':downloadLink, 'new_user':false, 'user_name':user.name, 'msg':'' };    
    PUBNUB.publish({
        channel: channel,
        message: {
            uuid: user.uuid,
            message: message
        }
    });
});

btnApplyClickStream.subscribe(function(){
    if(dom.btnUserName.value.length > 0){
        updateUserName(dom.btnUserName.value);
    }
});

btnUserNameStream.subscribe(function(e){
    if(e.keyCode === 13 && e.target.value.length){updateUserName(e.target.value);}
});

inputStream.subscribe(function(e){
    if(e.keyCode === 13 && dom.btnInput.value.length) {sendMessage(dom.btnInput.value);}
});

btnSendStream.subscribe(function(){
    if(dom.btnInput.value.length){
        sendMessage(dom.btnInput.value);
    }
});

//update user name
function updateUserName( username ){
    user.name = username;
    $("#username-container").hide(100,function(){
        $("#username-label").text("Hello " + user.name + " enjoy!");  
        $("#username-label").fadeOut(1000).fadeIn(1000,function(){
            $(this).text( user.name );
        });
    });
    //triger to update user name
    sendMessage('',true);
}

// I send the given message to all subscribed clients.
function sendMessage( message, new_user ){
    new_user = new_user || false;
    //delete html tags
    message_text = message.replace( /[<>]/g, '' );
    message = { 'link':'', 'new_user':new_user, 'user_name':user.name, 'msg':message_text };
    // Immediately add the message to the UI so the user
    // feels like the interface is super responsive.
    if(!new_user){
        appendMessage( message, true );
    }
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
    // ready for keep typing new messages.
    dom.btnInput.value = "";
    dom.btnInput.focus();
};
function receiveMessage(message){
    // Check to make sure the message is not just being
    // echoed back.
    console.log(message);    
    if (message.uuid === user.uuid){
        // This message has already been handled locally.
        return;
    }

    if( message.message.link.length ){
        updateDownloadAnchor(message.message.link);
        return;
    }

    if (message.message.new_user === true){
        $("#guest-label").text( message.message.user_name ).fadeOut(1000).fadeIn(1000);
        return;
    }
    // Add the message to the chat log.
    appendMessage( message.message, false );
}

function updateDownloadAnchor( link ){
    link = link.split(",");
    dom.downloadAnchor.href = link[0];
    dom.downloadAnchor.download = link[1];
    dom.downloadAnchor.textContent = link[2];
    dom.downloadAnchor.style.display = 'block';
    $("#download").fadeOut(1000).fadeIn(1000);
}
//Append the given message to the message log.
function appendMessage( message, isFromMe ){

    msg_time = formatAMPM(new Date());
    
     // If the message is form me (ie. the local user) then
    // add the appopriate class for visual distinction.
    if (isFromMe){
        msg_container = msg_sent_elem.replace("%user%",message.user_name.replace("-"," ")).replace("%time%",msg_time);
        $("div.msg_container_base").append(msg_container.replace("%message%",message.msg));}
    else{
        msg_container = msg_receive_elem.replace("%user%",message.user_name.replace("-"," ")).replace("%time%",msg_time);
        $("div.msg_container_base").append(msg_container.replace("%message%",message.msg));}
    // Creat the message item.

}

function subscribe(success){
    if(success){
        // Flag the user as subscribed.
        user.subscribed = true;}
    else{
        var messageItem =  $(".messages").html("<p>Error on subscribing to pubnub!!!</p>");
    }
}

msg_sent_elem = "<div class='row msg_container base_sent'><div class='col-md-10 col-xs-10'><div class='messages msg_sent'><p>%message%</p><time>%user% • %time%</time></div></div><div class='avatar'><img src='/images/avatar1.png' class='img-responsive'></div></div>";
msg_receive_elem = "<div class='row msg_container base_receive'><div class='avatar'><img src='/images/avatar1.png' class='img-responsive'></div><div class='col-md-10 col-xs-10'><div class='messages msg_receive'><p>%message%</p><time>%user% • %time%</time></div></div></div>";

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

/*$("#filecompleted").click(function(e){
    console.log("change from jquery");
});*/
