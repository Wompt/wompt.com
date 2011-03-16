
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

