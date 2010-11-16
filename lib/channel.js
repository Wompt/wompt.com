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
}

Channel.prototype = {
	add_client: function(client){
		this.clients.add(client);
		client.on('message', this._message_from_client);
	},
	
	receive_message: function(data){
		this.action_responders[data.action].call(this, data);
	},
	
	action_responders: {
		post: function(data){
			this.broadcast_message({
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
	
	broadcast_message: function(msg){
		this.broadcast(msg);
	},
	
	broadcast: function(msg){
		var list = this.clients.list;
		for(var id in list){
			var client = list[id];
			wompt.logger.log("Sending " + msg.msg + " to client " + id);
			client.send(msg);
		}
	}
}

exports.Channel = Channel;
