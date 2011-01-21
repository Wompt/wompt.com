var messageList,
    userList;

$(document).ready(function(){
	IO = new IO();

	messageList = new MessageList();
	userList = new UserList();
	uli = new UserListUI(userList, $('#user_list .users'));

	UI = new UI();
	UI.systemMessage("Connecting");
	
	IO.addMessageHandler(messageList);
	IO.addMessageHandler(userList);

	IO.connect();
	
	if(!readonly){
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
		UI.systemMessage("Connected!");
	});
	
	socket.on('disconnect', function(){
		UI.systemMessage("Disconnected!");
	});
	
	socket.on('message', function(data){
		for(var i=0, len=messageHandlers.length; i<len; i++){
			var handler = messageHandlers[i];
			if(handler.newMessage(data)) break;
		}
	});

	this.connect = function(){
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
	
	this.appendMessage = function(data){
		var line = $('<div>'),
				nick = $('<div>'),
				msg  = $('<div>');
		
		nick.text(data.from.name);
		nick.addClass('name');
		
		msg.text(data.msg);
		msg.addClass('msg');
		
		line.append(nick, msg);
		line.addClass('line')
		
		$('#messages').append(line);		
	}
	
	this.systemMessage = function(msg){
		this.appendMessage({from:{name: "System"}, msg:msg});		
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
