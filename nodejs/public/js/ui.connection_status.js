UI.once('init', function(){
	var socket = IO.socket,
	    authenticating = false,
	    try_now_link = $('.try_now');
			
	connectionStatus('Connecting', true);
	
	try_now_link.click(function(e){
		if(!socket.connected && !socket.connecting){
			socket.reconnect();
		}
		e.preventDefault();
	});
	
	socket.on('connect', function(){
		if(!socket.reconnecting) connectionStatus('Connected');
	});
	
	socket.on('disconnect', function(){
		connectionStatus('Not Connected' + (socket.options.reconnect ? ', trying again soon':''), true, socket.options.reconnect);
	});
	
	var reconnectTimer;
	socket.on('reconnecting', function(delay, attempts){
		var start = new Date().getTime();
		if(reconnectTimer) clearInterval(reconnectTimer);
		reconnectTimer = setInterval(function(){
			connectionStatus('Not Connected, trying again '
				+ timeDistance(start,delay), true, true);
		}, 100);
	});
	
	function timeDistance(start, delay){
		var since = new Date().getTime() - start,
		left = delay-since;
		if(left < 0) return " soon";
		if(left > 90000)
			return "in " + Math.floor(left / 60000) + ' minutes';
		else
			return "in " + Math.ceil(left / 1000) +  ' seconds';
	}
	
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
				if(data.version_hash != WOMPT.version_hash){
					authFailed("A new version of Wompt is available, automatically reloading ...");
					// Spread out reconnection just a bit, so as to not overload the server.
					setTimeout(function(){window.location.reload();}, Math.random()*5000.0 + 2000.0);
				}else if(data.connector_id){
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
			error: function(){
				authFailed("Authentication Failed - Try refreshing the page or signing in again");
			}
		});
	}
	
	function authFailed(text){
		authenticating = false;
		connectionStatus(text || "Can't Reconnect, please refresh the page", true);
		socket.options.reconnect = false;
		socket.disconnect();		
		updateStatus = false;
	}
	
	var was_disabled = true,
	    updateStatus = true,
	    overlay = $('#input_overlay');
	
	function connectionStatus(text, disable, try_now){
		if(!updateStatus) return;
		if(disable){
			overlay.show();
		}else if(was_disabled){
			overlay.fadeOut(1000);
		}
		try_now_link[try_now ? 'show':'hide']();
		was_disabled = disable;
		
		$('#message').attr('disabled',disable ? 'disable' : '');
		$('.connection_status').text(text);
	};
});
