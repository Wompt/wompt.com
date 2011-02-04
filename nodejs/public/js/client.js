var messageList,
    userList;
    
var msgcolor = 0;

$(document).ready(function(){
	IO = new IO();

	messageList = new MessageList();
	userList = new UserList();
	uli = new UserListUI(userList, $('#user_list .users'));

	UI = new UI();
	
	IO.addMessageHandler(messageList);
	IO.addMessageHandler(userList);

	IO.connect();
	
	if(!readonly){
		$('#message').keydown(function(e){
			if(e.keyCode == 13){
				var el = $(this),
						message = $.trim(el.val());
				
				if(message.length > WOMPT.messages.max_length){
					alert("Messages are limited to "+ WOMPT.messages.max_length + " characters.");
				}else	if(message.length > 0){
					IO.socket.send({chan: channel, action:'post', msg:message});
					el.val('');
				}
				
				e.preventDefault();
			}
		});
	}else {
		$('#message').val('Sign in to send messages');
		$('#message').attr('disabled', 'disabled');
	}
	$('#stats').click(function(e){
		IO.socket.send({chan: channel, action:'stats'});
	});
});


function IO(){
	var socket = this.socket = new io.Socket(window.location.hostname);
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


function UI(){
	if(!readonly){
		IO.socket.on('connect', function(){
			$('#message').attr('disabled', false).focus();
		});
	}
	
	this.appendMessages = function(data){
		var messages = data.messages;
		for(var i=0; i<messages.length; i++){
			this.appendMessage(messages[i]);
		}
	}

	this.update_connection_status = function(text){
		$('#connection_status').text(text);
	};
	
	this.appendMessage = function(data){
		var line = $('<div>'),
				timestamp = $('<div>'),
				nick = $('<div>'),
				msg  = $('<div>');
		
		nick.text(data.from.name);
		nick.addClass('name');
		
		var time = new Date();
		/*timestamp.text("(" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + ")");*/
		timestamp.append("(", 
			time.getHours() < 10 ? "0" + time.getHours() : time.getHours(), ":", 
			time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes(), ":", 
			time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds(), ")");
		timestamp.addClass('timestamp');		

		if(this.linkifyTest(data.msg)){
			//escape <,> so we don't include any nasty html tags
			data.msg = data.msg.replace(/</g, '&lt;').replace(/>/g,'&gt;');
			msg.html(this.linkify(data.msg));
		}
		else
			msg.text(data.msg);
		msg.addClass('msg');
		
		line.append(timestamp, nick, msg);
		line.addClass('line');
		if(msgcolor == 0){
			line.addClass('line0');
			msgcolor = 1;
		} else {
			line.addClass('line1');
			msgcolor = 0;
		}
		
		$('#messages').append(line);		
	}
	
	this.systemMessage = function(msg){
		this.appendMessage({from:{name: "System"}, msg:msg});		
	}
	
	this.linkify = function(inputText){
		var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		var replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
		var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		var replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
		var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
		var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
    return replacedText
	}

	this.linkifyTest = function(inputText){
		var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		if(inputText.match(replacePattern1))
			return true;
		var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		if(inputText.match(replacePattern2))
			return true;
		var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
		if(inputText.match(replacePattern3))
			return true;
    return false;
	}

}

function MessageList(){
	this.list = [];
}

MessageList.prototype.newMessage = function(msg){
	if(msg.action == 'message'){
		UI.appendMessage(msg);
		var msgDiv = document.getElementById("messages");
		msgDiv.scrollTop = msgDiv.scrollHeight;
		return true;
	}else if(msg.action == 'previous'){
		UI.appendMessages(msg);
		var msgDiv = document.getElementById("messages");
		msgDiv.scrollTop = msgDiv.scrollHeight;
		return true;
	}
}


function UserList(){
	this.list = [];
}

UserList.prototype = new EventEmitter();

UserList.prototype.newMessage = function(msg){
	switch(msg.action){
		case "join":
			this.list = this.list.concat(msg.users);
			this.emit('join', msg.users);
			break;
		case "part":
			this.list = this.list.concat(msg.users);			
			this.emit('part', msg.users);
			break;
		case "who":
			this.list = msg.users;
			this.emit('who', this.list);
		default:
			return false;
	}
	return true;
}



function UserListUI(ul, container){
	var user_divs = {};
	
	ul.on('join', function(users){
		var names=[];
		$.each(users, function(i, user){
			addUser(user);
			names.push(user.name);
		});
		UI.systemMessage("Joined: " + names.join(', '));
	});

	ul.on('part', function(users){
		var names=[];
		$.each(users, function(i, user){
			removeUser(user);
			names.push(user.name);
		});		
		UI.systemMessage("Left: " + names.join(', '));
	});
	
	ul.on('who', function(users){
		clearUserList();
		$.each(users, function(i, user){
			addUser(user);
		});
	});
	
	function addUser(user){
		var name_div = $('<div>');
		name_div.attr('id', 'user_' + user.id);
		name_div.attr('title', user.name);
		name_div.append(user.name);
		name_div.addClass('user');
		container.append(name_div);
		user_divs[user.id] = name_div;
	}
	
	function removeUser(user){
		if(user_divs[user.id]){
			user_divs[user.id].remove();
			delete user_divs[user.id];
		}
	}
	
	function clearUserList(){
		for(var i in user_divs){
			user_divs[i].remove();
		}
		user_divs = {};
	}
}
