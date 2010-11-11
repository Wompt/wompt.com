$(document).ready(function(){
	$('#message').keydown(function(e){
		if(e.keyCode == 13){
			var el = $(this);
			socket.send({chan: channel, action:'post', msg:el.val()});
			el.val('');
		}
	});
	
	$('#stats').click(function(e){
		socket.send({chan: channel, action:'stats'});
	});
	
	
	socket = new io.Socket(window.location.hostname);
	socket.connect();
	socket.send({chan: channel, action: 'join'});
	socket.on('message', function(data){
		switch(data.action){
			case 'stats':
				append_message("Clients: " + data.clients);
				break;
			default:
				append_message(data.from.name + " - " + data.msg);
		}
	});
});

function append_message(msg){
	var line = $('<div>')
	line.append(msg);
	$('#messages').append(line);		
}

function which_channel(){
	if(window.location.search && window.location.search.length > 0)
		return window.location.search;
	else
		return "default";
}

var channel = which_channel();
