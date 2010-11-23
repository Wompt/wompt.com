$(document).ready(function(){
	IO = new IO();
	IO.connect();
	
	UI = new UI();
	
	$('#message').keydown(function(e){
		if(e.keyCode == 13){
			var el = $(this),
			    message = $.trim(el.val());
					
			if(message.length > 0){
				IO.socket.send({chan: channel, action:'post', msg:message});
				el.val('');
			}
			
			e.preventDefault();
		}
	});
	
	$('#stats').click(function(e){
		IO.socket.send({chan: channel, action:'stats'});
	});

});


function IO(){
	var socket = this.socket = new io.Socket(window.location.hostname);

	socket.on('message', function(data){
		switch(data.action){
			case 'stats':
				UI.append_message("Clients: " + JSON.stringify(data.clients));
				break;
			default:
				UI.append_message(data);
		}
	});

	this.connect = function(){
		socket.connect();
		socket.send({channel: channel, action: 'join', session_id: session_id});
	}
}


function UI(){
	IO.socket.on('connect', function(){
		$('#message').attr('disabled', false).focus();
	});
	
	this.append_message = function(data){
		var line = $('<div>'),
				nick = $('<div>'),
				msg  = $('<div>');
				
		nick.append(data.from.name);
		nick.addClass('name');
		
		msg.append(data.msg);
		msg.addClass('msg');
		
		line.append(nick, msg);
		line.addClass('line')
		
		$('#messages').append(line);		
	}	
}