(function () {
	/* process to subscribe to the keydown event in the roomName input in order 
	to let the user know if it has rich the max length for a room name */
  var roomName = document.querySelector('#roomName'),//room name element
  roomNameMaxLength = 12,//max length for a room name
  lengthElem = document.querySelector('#length');//length label element

  //first an observable is added for the keydown event in the roomName element
  roomNameKeydownStream = Rx.Observable.fromEvent(roomName,'keydown')
  	.map(function(e){		
  		if(e.keyCode == 8 || e.keyCode == 46)//if user press backspace or delete key it will update the label  		
  			return (roomNameMaxLength - e.target.value.length)+1;
  		if(e.target.value.length >= roomNameMaxLength)//if length value has rich max length allowed we stop the user from entering more characters
  			e.preventDefault();
  		return roomNameMaxLength - e.target.value.length;
  	})
	.distinctUntilChanged();

	//function to update the html element
  	function setHTML(value){
  		lengthElem.innerHTML=value;
  	}

  	//we bind the function to the stream
  roomNameKeydownStream.subscribe(setHTML.bind());
}());