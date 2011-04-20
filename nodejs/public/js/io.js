function IO(){
	var secure = window.location.protocol.match(/https/);
	var socket = this.socket = new io.Socket(window.location.hostname, {
			secure: secure,
			reconnectionDelay: 2000 + Math.random() * 2000
		});

	var messageHandlers = [];

	this.processMessage = function(data){
		var stop;
		messageHandlers.forEach(function(handler){
			if(!stop) stop = handler.newMessage(data);
		});
	}
	
	this.addMessageHandler = function(handler){
		messageHandlers.push(handler);
	}
	
	this.connect = function(){
		socket.connect();
		socket.send({channel: channel, action: 'join', connector_id: connector_id});
	}
	
	socket.on('message', this.processMessage);
}
