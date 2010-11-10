var wompt  = require("./includes");

function Channel(config){
	this.name = config.name;
	this.messages = new wompt.MessageList();
	this.sessions = {};
	this.clients = {};
}

Channel.prototype = {
	process_request: function(con){
		var action = con.req.parts[3].split('?', 2);
		con.action = action[0];
		con.req.query = action[1];
		this.action_responders[con.action].call(this, con);
	},
	
	receive_message: function(data, client){
		this.action_responders[data.action].call(this, data, client);
	},
	
	action_responders: {
		join: function(data, client){
			this.clients[client.sessionId] = client;
		},
		
		post: function(data, client){
			this.send_message(data.msg, client)
		}
	},
	
	send_message: function(msg, client){
		this.inform_clients(msg, client);
	},
	
	inform_clients: function(msg){
		for(var id in this.clients){
			var client = this.clients[id];
			wompt.logger.log("Sending " + msg + " to client " + id);
			client.send({msg: msg});
		}
	},
}

exports.Channel = Channel;
