function Ops(uli){
	var self = this;
	uli.on('new_user', function(user, el){
		if(self.kick){
			var x = $('<span class="kick">');
			x.text('x');
			x.click(function(e){
				e.stopPropagation();
				e.preventDefault();
				IO.socket.send({action:'kick', id:user.id});
			});
			el.prepend(x)
		}
	})
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
			this.kick = true;
			UI.Messages.system("Because you are the first person in this Room, you have been given permission to temporarily kick out users");
		}
	}
}
