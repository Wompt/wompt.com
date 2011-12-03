function IO(){
	var secure = window.location.protocol.match(/https/);
	var socket = this.socket = io.connect(window.location.hostname, {
			secure: secure,
			transports:['websocket', 'flashsocket', 'htmlfile', 'xhr-multipart', 'xhr-polling', 'jsonp-polling'],
			reconnectionDelay: 2000 + Math.random() * 2000
		});

	var messageHandlers = [],
	processMessage = function(data){
		var stop;
		messageHandlers.forEach(function(handler){
			if(!stop) stop = handler.newMessage(data);
		});
	};
	
	this.addMessageHandler = function(handler){
		messageHandlers.push(handler);
	}
	
	this.connect = function(){
		socket.json.send({channel: channel, action: 'join', connector_id: connector_id});
	}
	
	socket.on('message', function(data) {
      if ($.isArray(data))
         data.forEach(processMessage);
      else
         processMessage(data);
   });
}
