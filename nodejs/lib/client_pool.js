var EventEmitter = require('events').EventEmitter;

function ClientPool(parentPool){
	var client_pool = this;
	if(parentPool) this.parent = parentPool;
	this.list = {};
	this.users = {};
	this.userCount = 0;
	this.count = 0;
	
	//called in the context of the client (this = client)
	this._on_client_disconnect = function(){
		client_pool.remove(this);
	}
}

var proto = ClientPool.prototype = new EventEmitter();;

proto.dec_user_count = function(client){
	var users = this.users
	  , id = client.uid
	  , n = users[id];
	if(id){
		if(n > 1)
			users[id]--;
		else{
			delete users[id];
			this.userCount--;
		}
	}
}

proto.inc_user_count = function(client){
	var users = this.users
	  , id = client.uid
	  , n = users[id];
	if(id){
		if(n > 0)
			users[id]++;
		else{
			users[id] = 1;
			this.userCount++;
		}
	}
}

proto.add = function(client){
	this.list[client.id] = client;
	this.inc_user_count(client)
	this.count++;
	this.emit('added', client);
	client.on('disconnect', this._on_client_disconnect);
};
	
proto.remove = function(client){
	delete this.list[client.id];
	this.dec_user_count(client);
	this.count--;
};

proto.each = function(iter){
	var list = this.list;
	for(var id in list){
		iter(list[id], id);
	}
}

proto.other_clients_from_same_user = function(except){
	var result = [];
	this.each(function(client){
		if(client.user == except.user && except != client)
			result.push(client);
	});
	return result;
}

proto.broadcast = function(msg, options){
	var except_client, only, msg_count=0;
	if(options){
		if(options.meta_data) // options is a Client to except
			except_client = options;
		else{
			only = options.only;
			if(options.first){
				options.first.json.send(msg);
				msg_count++;
				except_client = options.first;
			}
		}
	}
	var list = this.list;
	for(var id in list){
		var client = list[id];
		if(except_client && (except_client == client)) continue;
		if(only && !only(client)) continue;
		client.json.send(msg);
		msg_count++;
	}
	this.bubbleEmit('msgs_out', msg_count);
};

proto.sendToOne = function sendToOne(client, msg){
	client.json.send(msg);
	this.bubbleEmit('msgs_out', 1);
}

proto.onMessageIn = function onMessageIn(client, msg){
	this.bubbleEmit('msgs_in', 1);
}

proto.bubbleEmit = function bubbleEmit(){
	this.emit.apply(this, arguments);
	if(this.parent) this.parent.emit.apply(this.parent, arguments);
}


function ClientPoolStats(clientPool){
	var self = this;
	this.clients = clientPool;
	this.reset();
	
	clientPool.on('added', function(){
		if(clientPool.count > self.max)
			self.max = clientPool.count;
		self.new_connections++;
	})
	
	clientPool.on('msgs_out', function(count){
		self.msgs_out += count;
	})

	clientPool.on('msgs_in', function(count){
		self.msgs_in += count;
	})
}

ClientPoolStats.prototype.reset = function(){
	this.max = this.clients.count;
	this.msgs_in = 0;
	this.msgs_out = 0;
	this.new_connections = 0;
}

exports.ClientPool = ClientPool;
exports.ClientPoolStats = ClientPoolStats;
