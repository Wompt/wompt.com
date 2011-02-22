
// UI is a singleton with events
function UI(){};
UI.prototype = new EventEmitter();
UI = new UI();

// fires a custom event after the user has finished resizing the window
UI.once('init', function(){
	var UI = this
	  , settle_time = 100 // ms to wait before firing our event
	  , resize_timer;
	
	function emitResized(){
		UI.emit('resized');
		resize_timer = null;
	}
	
	$(window).resize(function(){
		if(resize_timer) clearTimeout(resize_timer);
		resize_timer = setTimeout(emitResized, settle_time);
	});	
});


UI.once('init', function(){	
	if(!readonly){
		IO.socket.on('connect', function(){
			$('#message').attr('disabled', false).focus();
		});
	}
});


UI.update_connection_status = function(text){
	$('#connection_status').text(text);
};

