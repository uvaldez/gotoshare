(function () {
  var argImages = ['bg.jpg','bg1.jpg'];
	/* process to subscribe to the keydown event in the roomName input in order 
	to let the user know if it has rich the max length for a room name */
  var roomName = document.querySelector('#roomName'),//room name element
  roomNameMaxLength = 12,//max length for a room name
  lengthElem = document.querySelector('#length'),//length label element
  btnStart = document.querySelector("#start");

  //first an observable is added for the keydown event in the roomName element
  roomNameKeydownStream = Rx.Observable.fromEvent(roomName,'keydown')
  	.map(function(e){
  		if(e.keyCode == 8 || e.keyCode == 46)//if user press backspace or delete key it will update the label  		
  			return (roomNameMaxLength - e.target.value.length)+1;
  		if(e.target.value.length >= roomNameMaxLength)//if length value has rich max length allowed we stop the user from entering more characters
  			e.preventDefault();
      if( e.keyCode === 13 ){//if user hit enter it will redirect to start the meeting
        window.location.href = "/start/"+e.target.value;
      }      
  		return roomNameMaxLength - e.target.value.length;
  	})
	.distinctUntilChanged();

	//function to update the html element
  	function setHTML(value){
  		lengthElem.innerHTML=value;
  	}

  	//we bind the function to the stream
  roomNameKeydownStream.subscribe(setHTML.bind());

  btnStartClickStream = Rx.Observable.fromEvent(btnStart,"click");
  btnStartClickStream.subscribe(function(){      
      if(roomName.value.length){
        window.location.href = "/start/"+roomName.value;
      }
  });

setInterval(function() {
  random = Math.floor(Math.random()*4);
  $('.header')
    .animate({opacity: 0}, 'slow', function() {
        $(this)
            .css({'background-image': 'url(/images/bg'+random+'.jpg)'})
            .animate({opacity: 1});
    });
  },500);
}());
