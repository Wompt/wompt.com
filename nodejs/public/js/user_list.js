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
	if(!ul) return;
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
