var wompt  = require("./includes"),
    constants = wompt.env.constants;
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
			if(channel.clients.other_clients_from_same_user(client).length == 0)
				channel.broadcast_user_list_change({'part': client.user});
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
			if(this.clients.other_clients_from_same_user(client).length == 0)
				this.broadcast_user_list_change({
					join: client.user,
					except: client
				});
		}
		
		client.on('message', this._message_from_client);
		client.on('disconnect', this._client_disconnected);
		
		this.send_initial_data(client);
	},
	
	send_initial_data: function(client){
		client.buffer_sends(function(){
			if(!this.messages.is_empty())
				client.send({action: 'previous', messages: this.messages.recent(10)});
			
			client.send({action: 'who',	users: this.get_user_list(client)});
		}, this);
	},
	
	receive_message: function(data){
		this.action_responders[data.action].call(this, data);
	},
	
	action_responders: {
		post: function(data){
			if(data.from_client.user.readonly) return;
			if(data.msg && data.msg.length > constants.messages.max_length) return;
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
	
	get_user_list: function(client){
		var users = {}, list = this.clients.list;
		
		for(var id in list){
			var cl = list[id],
			    doc = cl.user.doc,
			    uid = doc && doc._id;
			
			if(cl.user.visible && doc && !users[uid])
				users[uid]={
					name: doc.name || 'anonymous'
				};
		}
		return users;
	},
	
	broadcast_user_list_change: function(opt){
		var action;
		
		if(opt.part) action='part';
		else if(opt.join) action='join';
		
		var users = {}, user = opt.part || opt.join;
		users[user.doc._id] = {
			'name': user.doc.name
		} 
		
		this.broadcast_message({
			action:action,
			users: users
		}, opt.except);
	},
	
	broadcast_message: function(msg, except){
		this.clients.broadcast(msg, except);
	}
}

exports.Channel = Channel;
