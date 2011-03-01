
// UI is a singleton with events
function UI(){};
UI.prototype = new EventEmitter();
UI = new UI();

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

