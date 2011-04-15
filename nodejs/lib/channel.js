var wompt  = require("./includes")
   ,constants = wompt.env.constants
   ,events = require("events")
   ,util = require("util")
   ,logger = wompt.logger;

function Channel(config){
	var channel = this;
	
	this.last_activity = new Date();
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
		channel.touch();
		delete client.meta_data;
		if(client.user.visible){
			if(channel.clients.other_clients_from_same_user(client).length == 0)
				channel.broadcast_user_list_change({'part': client.user});
		}
	}
}

var proto = {
	add_client: function(client, token, joinMsg){
		this.touch();
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
		
		this.send_initial_data(client, joinMsg);
	},
	
	touch: function(type){
		this.touched = new Date();
	},
	
	send_initial_data: function(client, joinMsg){
		client.bufferSends(function(){
			if(!this.messages.is_empty())
				client.send({action: 'batch', messages: this.messages.since(joinMsg.last_timestamp)});
			
			client.send({action: 'who',	users: this.get_user_list(client)});
		}, this);
	},
	
	receive_message: function(data){
		this.touch();
		var responder = this.action_responders[data.action];
		if(responder)
			responder.call(this, data);
		else
			throw "No such action handler:" + data.action;
	},
	
	action_responders: {
		post: function(data){
			if(data.from_client.user.readonly) return;
			if(data.msg && data.msg.length > constants.messages.max_length) return;
			var message = {
				t: new Date().getTime(),
				action: 'message',
				msg: data.msg,
				from:{
					name: data.from_client.user.doc.name,
					id: data.from_client.user.id()
				}
			};
			this.broadcast_message(message, {first:data.from_client});
		}
	},
	
	get_user_list: function(client){
		var users = {}, list = this.clients.list;
		
		for(var id in list){
			var cl = list[id],
			    doc = cl.user.doc,
			    uid = cl.user.id();
			
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
		users[user.id()] = {
			'name': user.doc.name || user.doc.email
		} 
		
		var message = {
			t: new Date().getTime(),
			action:action,
			users: users
		};
		this.broadcast_message(message, opt.except);
	},
	
	broadcast_message: function(msg, except){
		this.emit('msg', msg);
		this.messages.add(msg);
		this.clients.broadcast(msg, except);
	},
	
	clean_up: function(){
		delete this.messages;
		delete this.clients;
		this.emit('destroy');
	}
}

util.inherits(Channel, events.EventEmitter);
for(var k in proto) Channel.prototype[k] = proto[k];

Channel.generalizeName = function(name){
	return name.toLowerCase();
}

Channel.hashName = function(name){
	return wompt.util.md5(name);
}

exports.Channel = Channel;
