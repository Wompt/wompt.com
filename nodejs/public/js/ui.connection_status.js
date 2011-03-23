UI.once('init', function(){
	var socket = IO.socket,
	    authenticating = false,
	    try_now_link = $('.try_now');
			
	connectionStatus('Connecting', true);
	
	try_now_link.click(function(){
		if(!socket.connected && !socket.connecting){
			socket.reconnect();
		}
	});
	
	socket.on('connect', function(){
		if(!socket.reconnecting) connectionStatus('Connected');
	});
	
	socket.on('disconnect', function(){
		connectionStatus('Not Connected' + (socket.options.reconnect ? ', trying again soon':''), true, true);
	});
	
	var reconnectTimer;
	socket.on('reconnecting', function(delay, attempts){
		var start = new Date().getTime();
		if(reconnectTimer) clearInterval(reconnectTimer);
		reconnectTimer = setInterval(function(){
			connectionStatus('Not Connected, trying again in '
				+ Math.ceil((start+delay - new Date().getTime())/1000) + " seconds", true, true);
		}, 100);
	});
	
	socket.on('reconnect', reauthenticate);
	
	function reauthenticate(){
		if(authenticating) return;
		if(reconnectTimer) clearInterval(reconnectTimer);
		connectionStatus('Authenticating', true);
		authenticating = true;
		$.ajax({
			url: '/re-authenticate',
			dataType: 'json',
			success: function(data){
				if(data.connector_id){
					socket.send({
						channel: channel
						,action: 'join'
						,connector_id: data.connector_id
						,last_timestamp: UI.Messages.list.lastTimeStamp()
					});
					connectionStatus('Connected');
					authenticating = false;
				} else authFailed();
			},
			error: authFailed
		});
	}
	
	function authFailed(){
		authenticating = false;
		connectionStatus("Can't Reconnect, please refresh the page", true);
	}
	
	var was_disabled = true;
	function connectionStatus(text, disable, try_now){
		var overlay = $('#input_overlay');
		if(disable){
			overlay.show();
			try_now_link[try_now ? 'show':'hide']();
		}else if(was_disabled){
			overlay.fadeOut(1000);
		}
		was_disabled = disable;
		
		$('#message').attr('disabled',disable ? 'disable' : '');
		$('.connection_status').text(text);
	};
});
