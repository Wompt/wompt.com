
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


// makes sure the message list is bottom aligned when it's smaller than the
// viewport but still allows the parent to scroll.
UI.once('init', function(){
	function positionMessageList(){
		var message_list = $('#message_list');
		var taller = message_list.height() > message_list.parent().height();
		
		message_list.css({'position':(taller ? 'static' : 'absolute')})
	}
	
	UI.on('resized', positionMessageList);
	UI.on('message_appended', positionMessageList);
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

