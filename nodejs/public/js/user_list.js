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

function UserListUI(ul, container, top){
	if(!ul) return;
	var user_divs = {},
	self = this,
	// Single Anonymous user for the userlist
	anonymous = {el: null, count:0},
	sorted = [];
	
	this.container = container;
	
	ul.on('join', function(users){
		$.each(users, function(id, user){
			user.id = id;
			addUser(user);
		});
		updateUserCount();
	});

	ul.on('part', function(users){
		$.each(users, function(id, user){
			user.id = id;
			if(id == 'anonymous')
				removeAnonymous(user);
			else
				removeUser(user);
		});
		updateUserCount();
	});
	
	ul.on('who', function(users){
		clearUserList();
		$.each(users, function(id, user){
			user.id = id;
			addUser(user);
		});
		updateUserCount();
	});
	
	function addUser(user){
		if(user.id == 'anonymous') return addAnonymous(user);
		
		if(user_divs[user.id]) return;
		
		var name_div = user.el = $('<div>'),
		link;
		if(UI.hideProfileLinks){
			link = $('<span>');
		}else{
			link = $('<a>');
			link.attr('href','/users/' + user.id);		
		}
		
		name_div.attr({
			id:'user_' + user.id,
			'class': 'user'
		});
		name_div.append(link);
		
		link.attr({
			title: user.name,
			target: "_blank",
			style: 'color:' + UI.Colors.forUser(user.id) + ';'
		});
		link.text(user.name);
		
		var insert_after = addToSortedList(user);
		if(insert_after)
			insert_after.el.after(name_div);
		else
			container.prepend(name_div);
		user_divs[user.id] = name_div;
		
		self.emit('new_user', user, name_div);
	}
	
	function addAnonymous(user){
		var a = anonymous;
		if(!a.el){
			a.el = $('<div>');
			a.id = user.id;
			user_divs[a.id] = a.el;
			a.el.attr({
				'class': 'user anon'
			});
			a.count = 0;
			top.prepend(a.el);
		}
		
		a.count += user.count;
		
		a.el.text("Anonymous ("+ a.count +")");
	}
	
	function removeAnonymous(user){
		var a = anonymous;
		if(!a.el) return;

		a.count -= user.count;
	
		if(a.count <= 0){
			removeUser(a);
			a.el = null;
			a.count = 0;
		}else{
			a.el.text("Anonymous ("+ a.count +")");
		}
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
		anonymous.el = null;
		user_divs = {};
		sorted = [];
	}
	
	function updateUserCount(){
		$('#user_count').text('(' + (sorted.length + anonymous.count) + ')');
	}
}

Util.inherits(UserListUI, EventEmitter);
