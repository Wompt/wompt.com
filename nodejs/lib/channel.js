var wompt  = require("./includes")
   ,constants = wompt.env.constants
   ,events = require("events")
   ,util = require("util")
   ,logger = wompt.logger;

// Callback executed once DB record is loaded
function Channel(config, callback){
	var channel = this;
	
	this.name = config.name;
	this.namespace = config.namespace;
	this.config = config;
	this.messages = new wompt.MessageList(this);
	// Passing in the parent ClientPool that events will get bubbled to
	this.clients = new wompt.ClientPool(config.channelManager.clients);
	this.opsUsers = {};
	
	// Called from the context of the client
	this._message_from_client = function(msg){
		// It's less memory expensive to listen for this event here than in the
		// client pool, since we have one client-pool per user
		channel.clients.onMessageIn(this, msg);
		msg.from_client = this;
		channel.receive_message(msg);
	}
	
	this._client_disconnected = function(){
		var client = this;
		channel.touch();
		delete client.meta_data;
		if(client.user.visible){
			// Anonymous clients are treated independently for the userlist (anon count = anonymous clients)
			if(!client.user.authenticated() || channel.clients.other_clients_from_same_user(client).length == 0){
				channel.broadcast_user_list_change({'part': client.user});
				
				if(channel.config.ops && client.user.authenticated())
					channel.delay_release_ops(client.uid)
			}
		}
	}
	
	wompt.models.Room.findOrCreate({name:this.name, namespace:this.namespace}, function(room){
		channel.room = room;
		callback(channel);
	});	
}


var proto = {
	add_client: function(client, token, joinMsg){
		this.touch();
		client.meta_data = {
			channel: this,
			token: token,
			joined: Date.now()
		};

		// TODO: this should also check if another user has ops that aren't expired
		if(this.config.ops && this.clients.userCount == 0 && client.user.authenticated() && this.vacant_ops())
			this.give_ops(client)

		this.clients.add(client);

		if(client.user.visible){
			// Anonymous clients are treated independently for the userlist (anon count = anonymous clients)
			if(!client.user.authenticated() || this.clients.other_clients_from_same_user(client).length == 0)
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
		var msgs = [];
		if(!this.messages.is_empty())
			msgs.push({
				action: 'batch',
			  	messages: this.messages.since(joinMsg.last_timestamp)
			});

		// Disabled, when enabling, add sent messages to msgs somehow
		//this.send_ops(client);
		msgs.push({action: 'who',	users: this.get_user_list(client)});
		this.clients.sendToOne(client, msgs);
	},
	
	send_ops: function(client){
		if(!this.config.ops) return;
		
		var ops = this.get_ops(client.uid);
		if(ops){
			// If a user comes back before the delayed ops release, clear the timer
			if(ops && ops.timer) clearTimeout(ops.timer);
			this.clients.sendToOne(client,{action: 'ops', kick: true});
		}else{
			this.clients.sendToOne(client,{action: 'ops', kick: false});
		}
	},
	
	give_ops: function(client){
		this.opsUsers[client.uid] = {};
	},
	
	get_ops: function(uid){
		if(uid){
			return this.opsUsers[uid];
		}
	},
	
	vacant_ops: function(){
		for(var key in this.opsUsers)
			return false;
		return true;
	},
	
	delay_release_ops: function(uid){
		var ops = this.opsUsers[uid],
		self = this;
		
		if(ops){
			ops.timer = setTimeout(function(){
				self.release_ops(uid);
			}, wompt.env.ops.keep_when_absent_for)
		}				
	},
	
	release_ops: function(uid){
		var ops = this.opsUsers[uid],
		oldest_client,
		oldest_join = Date.now();
		
		this.clients.each(function(client){
			var meta = client.meta_data;
			if(client.uid != uid && meta.joined < oldest_join && client.user.authenticated()){
				oldest_join = meta.joined;
				oldest_client = client;
			}
		});
		
		if(oldest_client){
			this.give_ops(oldest_client);
			// TODO - we need to inform all clients that ops have transfered
			this.send_ops(oldest_client);
		}
		
		delete this.opsUsers[uid];
	},
	
	receive_message: function(data){
		this.touch();
		var responder = this.action_responders[data.action];
		if(responder)
			responder.call(this, data);
	},
	
	action_responders: {
		post: function post(data){
			if(data.from_client.user.readonly) return;
			if(data.msg && data.msg.length > constants.messages.max_length) return;
			var message = {
				t: Date.now(),
				action: 'message',
				msg: data.msg,
				from:{
					name: data.from_client.user.doc.name,
					id: data.from_client.user.id()
				}
			};
			this.broadcast_message(message, {first:data.from_client});
		},
		
		kick: function kick(kick){
			if(!this.config.ops || !this.opsUsers[kick.from_client.uid]) return;
			
			this.clients.each(function(client){
				if(client == kick.from_client) return;
				if(client.uid != kick.id) return;
				client.json.send({
					action:'kick'
					,from:{
						name: kick.from_client.user.doc.name,
						id: kick.from_client.user.id()
					}
				});
			})
		}
	},
	
	get_user_list: function(client){
		var users = {anonymous:{count:0}},
		list = this.clients.list,
		now = new Date();
		
		for(var id in list){
			var cl = list[id],
			    doc = cl.user.doc,
			    uid = cl.user.id();
			
			if(cl.user.visible && doc){
				if(!users[uid]){
					var user_info = users[uid] = {
						name: doc.name || 'anonymous'
					};
					if(doc.account_user_id)
						user_info['user_id'] = doc.account_user_id;
						
					var ops = this.opsUsers[uid];
					if(ops)
						users[uid].ops = true;
				}
			}else {
				users.anonymous.count++;
			}
		}
		
		if(users.anonymous.count == 0) delete users.anonymous;
		
		return users;
	},
	
	broadcast_user_list_change: function(opt){
		var action, dont_emit, ops = this.config.ops;
		
		if(opt.part) action='part';
		else if(opt.join) action='join';
		
		var users = {}, user = opt.part || opt.join;
		if(user.authenticated()){
			var uid = user.id(),
			user_info = users[uid] = {
				'name': user.doc.name || user.doc.email
			}
			if(user.doc.account_user_id)
				user_info['user_id'] = user.doc.account_user_id;

			if(opt.join && ops && this.get_ops(uid)){
				user_info.ops = true;
			}
		} else {
			users.anonymous = {count:1};
			// anonymous join / parts shouldn't be emitted (and thus logged to disk)
			dont_emit = true;
		}
		
		var message = {
			t: new Date().getTime(),
			action:action,
			users: users
		};
		this.broadcast_message(message, opt.except, dont_emit);
	},
	
	broadcast_message: function(msg, except, dont_emit){
		if(!dont_emit)
			this.emit('msg', msg);
		this.clients.broadcast(msg, except);
	},
	
	clean_up: function(){
		delete this.messages;
		delete this.clients;
		delete this.room;
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
