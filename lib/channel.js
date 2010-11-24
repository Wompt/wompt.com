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
		channel.receive_message(msg);
	}
	
	this._client_disconnected = function(){
		var client = this;
		channel.broadcast_user_list_change({
			part: [client.user ? client.user.doc.name : 'anonymous']
		});
	}
}

Channel.prototype = {
	add_client: function(client){
		this.clients.add(client);
		
		this.broadcast_user_list_change({
			join: [client.user ? client.user.doc.name : 'anonymous'],
			except: client
		});
		
		this.send_user_list(client);
		
		client.on('message', this._message_from_client);
		client.on('disconnect', this._client_disconnected);
	},
	
	receive_message: function(data){
		this.action_responders[data.action].call(this, data);
	},
	
	action_responders: {
		post: function(data){
			this.broadcast_message({
				action: 'message',
				msg: data.msg,
				from:{
					name: data.from_client.user.doc.name || 'anonymous',
					id: data.from_client.user.doc._id
				}
			});
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
		var names = [], list = this.clients.list;
		for(var id in list){
			var cl = list[id];
			if(cl.user.doc)
				names.push(cl.user.doc.name || 'anonymous');
		}
		client.send({
			action: 'who',
			users: names
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
		this.broadcast(msg, except);
	},
	
	broadcast: function(msg, except){
		var list = this.clients.list;
		for(var id in list){
			var client = list[id];
			if(except == client) continue;
			wompt.logger.log("Sending " + msg.msg + " to client " + id);
			client.send(msg);
		}
	}
}

exports.Channel = Channel;
