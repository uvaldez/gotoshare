/*
    Javascript file for handle chat using pubnub api
    this file will also handle user name update and file upload notifications

    January 2016
    @UzielValdez
*/

//configuration for pubnub api
PUBNUB.init({
    publish_key: 'pub-c-17c0177d-d952-4745-a506-5019121be7f1',
    subscribe_key: 'sub-c-04342e80-bad1-11e5-8b32-02ee2ddab7fe',
    ssl: true
  });

// user object each user has a unique id
var user = {
            uuid: null,
            name: "Guest",
            subscribed: false
        };

// channel that will be used for chat
channel = document.querySelector( "#channel" ).value;

// get UUID from pubnub
Rx.DOM.ready().subscribe(
    function(){// ready
        getUUID();
    },
    function( err ){// on error
        console.log( err );
    },
    function(){// when completed
        PUBNUB.subscribe({
            channel: channel,
            callback: receiveMessage,
            connect: subscribe(true),
            error: subscribe(false),
            presence: function(m){
                /* Presence is used for detecting online users and 
                know when a user has leave the chat room */
            }
        });
    }
);

function getUUID(){
    var uuid = PUBNUB.uuid();
    // Store the UUID with the user.
    user.uuid = uuid;
    user.name = document.querySelector( "#user_name" ).value.replace( " " , "-" );
}

// DOM Elements that we are going to be calling frecuently
dom = {};
dom.btnInput = document.querySelector( "#btn-input" );
dom.btnChat = document.querySelector( "#btn-chat" );
dom.btnUserName = document.querySelector( "#btn-username" );
dom.btnApplyUserName = document.querySelector( "#apply" );
dom.download =  document.querySelector( "#filecompleted" );
dom.downloadAnchor = document.querySelector( "a#download" );

// Stream Elements using RxJS
btnApplyClickStream = Rx.Observable.fromEvent( dom.btnApplyUserName, "click" );
inputStream = Rx.Observable.fromEvent( dom.btnInput, "keyup" );
btnSendStream = Rx.Observable.fromEvent( dom.btnChat, "click" );
btnUserNameStream = Rx.Observable.fromEvent( dom.btnUserName, "keyup" );
downloadChangeStream = Rx.Observable.fromEvent( dom.download, "click" );

/* Stream to check when the user has upload a file
    when uploading finish it send a message to the other user with link to download the file */
downloadChangeStream.subscribe( function(){
    // we build download link from downloadAnchor element
    downloadLink = dom.downloadAnchor.href + "," + downloadAnchor.download + "," + downloadAnchor.textContent;
    
    // we build the message to send with standar structure being used in all application
    message = { 'link': downloadLink, 'new_user': false, 'user_name': user.name, 'msg': '' };

    // send the message through pubnub
    PUBNUB.publish({
        channel: channel,
        message: {
            uuid: user.uuid,
            message: message
        }
    });

});

// Stream for apply button that updates user name
btnApplyClickStream.subscribe( function(){
    if( dom.btnUserName.value.length > 0 ){
        updateUserName( dom.btnUserName.value );
    }
});

// stream for user name input, when user hits enter key it calls updateUserName method
btnUserNameStream.subscribe( function(e){
    if( e.keyCode === 13 && e.target.value.length ){
        updateUserName( e.target.value );
    }
});

// stream for textbox messages, when user hits enter key it calls sendMessage method 
inputStream.subscribe( function(e){
    if( e.keyCode === 13 && dom.btnInput.value.length ){
        sendMessage( dom.btnInput.value );
    }
});

// stream for send button in chat window
btnSendStream.subscribe( function(){
    if( dom.btnInput.value.length ){
        sendMessage( dom.btnInput.value );
    }
});

// update user name
function updateUserName( username ){
    // updates user structure
    user.name = username;

    // updates label in publisher container
    $( "#username-container" ).hide( 100, function(){
        $( "#username-label" )
            .text( "Hello " + user.name + " enjoy!" )
            .fadeOut( 1000 ).fadeIn( 1000, function(){
                $(this).text( user.name );
            });
    });

    // triger to update user name on the other room
    sendMessage( '' , true );
}

// I send the given message to subscribed users.
function sendMessage( message, new_user ){
    // default value is set to false
    new_user = new_user || false;
    
    // delete html tags
    message_text = message.replace( /[<>]/g, '' );

    /* we build message with standard being used in all application
       link      -> is being used to notify that remote user has upload a file
       new_user  -> to notify remote user that the user name has been updated
       user_name -> so we can show friendly user name in remote user's chat window
       msg       -> the message being send */ 
    message = { 'link':'', 'new_user': new_user, 'user_name': user.name, 'msg': message_text };

    // add the message to the UI
    if( !new_user ){
        appendMessage( message, true );
    }

    // Push the message to PubNub. Attach the user UUID
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
}

function receiveMessage( message ){
    // Check to make sure the message is not just being
    // echoed back.
    if ( message.uuid === user.uuid ){
        // This message has already been handled locally.
        return;
    }

    // Check if message is a file uploaed notification, if so, it will update dowloandAnchor
    if( message.message.link.length ){
        updateDownloadAnchor( message.message.link );
        // no need to append message
        return;
    }

    // check if message is to update user name
    if ( message.message.new_user === true ){
        // update subscriber div with new user name, make a higlight animation (litte highlight)
        $( "#guest-label" )
            .text( message.message.user_name )
            .fadeOut(1000)
            .fadeIn(1000);

        // no need to append message
        return;
    }

    // Add the message to the chat log.
    appendMessage( message.message, false );
}

function updateDownloadAnchor( link ){
    // First we convert the link to array by spliting it
    link = link.split( "," );

    // we build the downloadAnchor
    // first element is the link
    dom.downloadAnchor.href = link[ 0 ]; 
    
    // second element download attribute
    dom.downloadAnchor.download = link[ 1 ];

    // third element textContext
    dom.downloadAnchor.textContent = link[ 2 ];

    // show the anchor to the user as it is hidden when the page loads
    dom.downloadAnchor.style.display = 'block';

    // a bit of animation so the user can notice
    $( "#download" )
        .fadeOut( 1000 )
        .fadeIn( 1000 );
}

// Append the given message to the message log.
function appendMessage( message, isFromMe ){

    // variable to handel message time in AM/PM format
    msg_time = formatAMPM( new Date() );
    
    // If the message is from me (local user) then
    // add the appopriate class for visual distinction.
    if ( isFromMe ){
        // Replace msg_sent_elem each element with correct values (this can be improve latter)
        msg_container = msg_sent_elem
                        .replace( "%user%", message.user_name.replace( "-", " " ) )
                        .replace( "%time%", msg_time );

        $( "div.msg_container_base" )
            .append( msg_container.replace( "%message%", message.msg ) );
    }            
    else{
        // Creat the message item.
        msg_container = msg_receive_elem
                        .replace( "%user%", message.user_name.replace( "-", " " ) )
                        .replace( "%time%", msg_time );

        $(  "div.msg_container_base" )
            .append( msg_container.replace( "%message%", message.msg ) );
    }

}

function subscribe( success ){
    
    if( success ){
        // Flag the user as subscribed.
        user.subscribed = true;
    }
    else {
        var messageItem =  $( ".messages" ).html( "<p>Error on subscribing to pubnub!!!</p>" );
    }

}

// handlers variables for append message in chat window 
// (this can be improved latter in order to have only one variable)
msg_sent_elem = "<div class='row msg_container base_sent'><div class='col-md-10 col-xs-10'><div class='messages msg_sent'><p>%message%</p><time>%user% • %time%</time></div></div><div class='avatar'><img src='/images/avatar1.png' class='img-responsive'></div></div>";
msg_receive_elem = "<div class='row msg_container base_receive'><div class='avatar'><img src='/images/avatar1.png' class='img-responsive'></div><div class='col-md-10 col-xs-10'><div class='messages msg_receive'><p>%message%</p><time>%user% • %time%</time></div></div></div>";

// function to format time AM/PM format by http://stackoverflow.com/users/507770/bbrame
function formatAMPM( date ) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

