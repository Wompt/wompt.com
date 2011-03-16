UI.once('init', function(){
	var socket = IO.socket,
	    authenticating = false;
	
	socket.on('connect', function(){
		if(!socket.reconnecting) connectionStatus('Connected');
	});
	
	socket.on('disconnect', function(willReconnect){
		connectionStatus('Not Connected' + (willReconnect? ', trying again soon':''));
	});
	
	var reconnectTimer;
	socket.on('reconnecting', function(delay, attempts){
		var start = new Date().getTime();
		if(reconnectTimer) clearInterval(reconnectTimer);
		reconnectTimer = setInterval(function(){
			connectionStatus('Not Connected, trying again in '
				+ Math.round((start+delay - new Date().getTime())/1000) + " seconds");
		}, 100);
	});
	
	socket.on('reconnect', function(){
		if(reconnectTimer) clearInterval(reconnectTimer);
		connectionStatus('Authenticating');
		authenticating = true;
		$.ajax({
			url: '/re-authenticate',
			dataType: 'json',
			success: function(data){
				if(data.connector_id){
					socket.send({channel: channel, action: 'join', connector_id: data.connector_id});
					connectionStatus('Connected');
					authenticating = false;
				} else authFailed();
			},
			error: authFailed
		});
	});
	
	function authFailed(){
		authenticating = false;
		connectionStatus("Can't Reconnect, please refresh the page");
	}
	
	
	connectionStatus = function(text){
		$('#connection_status').text(text);
	};
});