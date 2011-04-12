function UserList(){
	this.users = {};
}

UserList.prototype = new EventEmitter();

UserList.prototype.newMessage = function(msg){
	var a = msg.action,
	me = this;
	
	if(a == "join"){
		$.extend(me.users, msg.users);
		me.emit('join', msg.users);
		
	} else if(a == "part"){
		var users = me.users;
		$.each(msg.users, function(id, user){if(users[id]) delete users[id]});
		me.emit('part', msg.users);
		
	} else if(a == "who"){
		me.users = msg.users || {};
		me.emit('who', me.users);
		
	} else if(a == "batch"){
		$.each(msg.messages, function(msg){
			me.newMessage(msg);
		});
	}
}

// iteration must halt when f returns false
UserList.prototype.each = function(f){
	$.each(this.users,f);	
}

function UserListUI(ul, container){
	if(!ul) return;
	var user_divs = {};
	
	ul.on('join', function(users){
		var names=[];
		$.each(users, function(id, user){
			user.id = id;
			addUser(user);
			names.push(user.name);
		});
	});

	ul.on('part', function(users){
		var names=[];
		$.each(users, function(id, user){
			user.id = id;
			removeUser(user);
			names.push(user.name);
		});		
	});
	
	ul.on('who', function(users){
		clearUserList();
		$.each(users, function(id, user){
			user.id = id;
			addUser(user);
		});
	});
	
	function addUser(user){
		var name_div = $('<div>');
		name_div.attr('id', 'user_' + user.id);
		name_div.attr('title', user.name);
		name_div.css('color', UI.Colors.forUser(user.id))
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
