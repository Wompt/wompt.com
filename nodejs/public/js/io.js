function IO(){
	var secure = window.location.protocol.match(/https/);
	var socket = this.socket = new io.Socket(window.location.hostname, {
			secure: secure,
			port: secure ? '' : window.location.port
		});
	var messageHandlers = [];

	socket.on('connect', function(){
		UI.update_connection_status('Connected');
	});
	
	socket.on('disconnect', function(){
		UI.update_connection_status('Not Connected');
	});
	
	socket.on('message', function(data){
		for(var i=0, len=messageHandlers.length; i<len; i++){
			var handler = messageHandlers[i];
			if(handler.newMessage(data)) break;
		}
	});

	this.connect = function(){
		UI.update_connection_status('Connecting');
		socket.connect();
		socket.send({channel: channel, action: 'join', connector_id: connector_id});
	}
	
	this.addMessageHandler = function(handler){
		messageHandlers.push(handler);
	}
}
