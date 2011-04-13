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
	var user_divs = {},
	sorted = [];
	
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
		if(user_divs[user.id]) return;
		
		var name_div = user.el = $('<div>');
		name_div.attr('id', 'user_' + user.id);
		name_div.attr('title', user.name);
		name_div.css('color', UI.Colors.forUser(user.id))
		name_div.append(user.name);
		name_div.addClass('user');
		var insert_after = addToSortedList(user);
		if(insert_after)
			insert_after.el.after(name_div);
		else
			container.prepend(name_div);
		user_divs[user.id] = name_div;
	}
	
	function addToSortedList(user){
		sorted.push(user);
		sorted.sort(function(a,b){
			return a.name.localeCompare(b.name);
		});
		var i=sorted.indexOf(user);
		return i > 0 ? sorted[i-1] : null;
	}
	
	function removeUser(user){
		if(user_divs[user.id]){
			user_divs[user.id].remove();
			sorted = sorted.filter(function(each){
				return user.id != each.id;
			});
			delete user_divs[user.id];
		}
	}
	
	function clearUserList(){
		for(var i in user_divs){
			user_divs[i].remove();
		}
		user_divs = {};
		sorted = [];
	}
}
