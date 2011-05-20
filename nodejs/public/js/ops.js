function Ops(uli){
	var self = this;
	
	this.uli = uli;
	this.permissions = {};
	
	uli.on('new_user', function(user, el){
		if(user.ops){
			var ops = $('<div class="ops">');
			el.append(ops);
		} else {
			var kick = $('<div class="kick">');
			kick.data('uid', user.id);
			el.prepend(kick);
		}
	})

	// Use JS event bubbling instead of one event handler per user
	uli.container.click(function(e){
		// target is the kick button that was clicked
		var target = $(e.target), uid;
		if(self.permissions.kick && target.hasClass('kick') && (uid = target.data('uid'))){
			e.stopPropagation();
			e.preventDefault();
			IO.socket.send({action:'kick', id:uid});
		}
	});	
}

Ops.prototype = {
	newMessage: function(data){
		var a = data.action;
		if(a == 'kick'){
			UI.Messages.system(data.from.name +  " has temporarily kicked you out of this room, Wompt will automatically reconnect in "+WOMPT.ops.kick_time+" seconds.");
			IO.socket.disconnect();
			setTimeout(function(){
				IO.socket.reconnect();
			},WOMPT.ops.kick_time*1000)
			return true;
		} else if (a == 'ops'){
			this.permissions = data;
			this.uli.container.toggleClass('ops_kick', data.kick);
			if(data.kick)
				UI.Messages.system("Because you are the only person in this Room, you have been given permission to temporarily kick out users");
		}
	}
}
