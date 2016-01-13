document.querySelector('input[type=file]').onchange = function() {
    var file = this.files[0];
	var reader = new window.FileReader();
	reader.readAsDataURL(file);
	reader.onload = onReadAsDataURL;
};

var localConnection, remotePeerConnection, sendChannel, receiveChannel;
var chunkLength = 1000;
var servers = {
'iceServers': [{
  'url': 'stun:stun.l.google.com:19302'
}]
};
var localConnection = new webkitRTCPeerConnection(servers, {
  optional: [{
    RtpDataChannels: true
  }]
});

localConnection.onicecandidate = function(event) {
  if (event.candidate) {
    remotePeerConnection.addIceCandidate(event.candidate);
  }
};

sendChannel = localConnection.createDataChannel('sendDataChannel');

sendChannel.onopen = function(event) {
  var readyState = sendChannel.readyState;
  if (readyState == "open") {
    sendChannel.send("Hello");
  }
};

var remotePeerConnection = new webkitRTCPeerConnection(servers, {
  optional: [{
    RtpDataChannels: true
  }]
});

remotePeerConnection.onicecandidate = function(event) {
  if (event.candidate) {
    localPeerConnection.addIceCandidate(event.candidate);
  }
};

remotePeerConnection.ondatachannel = function(event) {
  receiveChannel = event.channel;
  receiveChannel.onmessage = function(event) {
    console.log(event.data);
  };
};

localConnection.createOffer(function(desc) {
  localConnection.setLocalDescription(desc);
  remotePeerConnection.setRemoteDescription(desc);
  remotePeerConnection.createAnswer(function(desc) {
    remotePeerConnection.setLocalDescription(desc);
    localConnection.setRemoteDescription(desc);
  });
});

var arrayToStoreChunks = [];
sendChannel.onmessage = function (event) {
    var data = JSON.parse(event.data);

    arrayToStoreChunks.push(data.message); // pushing chunks in array

    if (data.last) {
        saveToDisk(arrayToStoreChunks.join(''), 'fake fileName');
        arrayToStoreChunks = []; // resetting array
    }
};

function onReadAsDataURL(event, text) {
    var data = {}; // data object to transmit over data channel

    if (event) text = event.target.result; // on first invocation

    if (text.length > chunkLength) {
        data.message = text.slice(0, chunkLength); // getting chunk using predefined chunk length
    } else {
        data.message = text;
        data.last = true;
    }

    sendChannel.send(JSON.stringify(data)); // use JSON.stringify for chrome!

    var remainingDataURL = text.slice(data.message.length);
    if (remainingDataURL.length) setTimeout(function () {
        onReadAsDataURL(null, remainingDataURL); // continue transmitting
    }, 500)
}

function saveToDisk(fileUrl, fileName) {
    var save = document.createElement('a');
    save.href = fileUrl;
    save.target = '_blank';
    save.download = fileName || fileUrl;

    var event = document.createEvent('Event');
    event.initEvent('click', true, true);

    save.dispatchEvent(event);
    (window.URL || window.webkitURL).revokeObjectURL(save.href);
}