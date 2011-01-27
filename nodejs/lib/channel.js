var wompt  = require("./includes");
var logger = wompt.logger;

function Channel(config){
	var channel = this;
	
	this.name = config.name;
	this.messages = new wompt.MessageList();
	this.clients = new wompt.ClientPool();
	
	// Called from the context of the client
	this._message_from_client = function(msg){
		msg.from_client = this;
		this.user.touch();
		channel.receive_message(msg);
	}
	
	this._client_disconnected = function(){
		var client = this;
		if(client.user.visible){
			channel.broadcast_user_list_change({
				part: [{
					name: client.user.doc ? client.user.doc.name : 'anonymous',
					id: client.user.doc._id
				}]
			});
		}
	}
}

Channel.prototype = {
	add_client: function(client, token){
		client.meta_data = {
			channel: this,
			token: token
		};

		this.clients.add(client);

		if(client.user.visible){
			this.broadcast_user_list_change({
				join: [{
					name: client.user.doc ? client.user.doc.name : 'anonymous',
					id: client.user.doc._id
				}],
				except: client
			});
		}
		
		this.send_user_list(client);
		
		client.on('message', this._message_from_client);
		client.on('disconnect', this._client_disconnected);
		
		client.send({action: 'previous', messages: this.messages.recent(10)});
	},
	
	receive_message: function(data){
		this.action_responders[data.action].call(this, data);
	},
	
	action_responders: {
		post: function(data){
			if(data.from_client.user.readonly) return;
			var message = {
				action: 'message',
				msg: data.msg,
				from:{
					name: data.from_client.user.doc.name,
					id: data.from_client.user.doc._id
				}
			};
			this.messages.add(message);
			this.broadcast_message(message);
		},
		
		stats: function(data){
			data.from_client.send({
				action: 'stats',
				clients: {
					app: this.app.clients.count,
					channel: this.clients.count,
					me: data.from_client.user.clients.count
				}
			});
		}
	},
	
	send_user_list: function(client){
		var users = [], list = this.clients.list;
		for(var id in list){
			var cl = list[id];
			if(cl.user.visible && cl.user.doc)
				users.push({
					name: cl.user.doc.name || 'anonymous',
					id: cl.user.doc._id
				});
		}
		client.send({
			action: 'who',
			users: users
		});
	},
	
	broadcast_user_list_change: function(opt){
		var action;
		
		if(opt.part) action='part';
		else if(opt.join) action='join';
		
		this.broadcast_message({
			action:action,
			users: opt.part || opt.join
		}, opt.except);
	},
	
	broadcast_message: function(msg, except){
		this.clients.broadcast(msg, except);
	}
}

exports.Channel = Channel;
