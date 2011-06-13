var EventEmitter = require('events').EventEmitter;

function ClientPool(){
	var client_pool = this;
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
	this.list[client.sessionId] = client;
	this.inc_user_count(client)
	this.count++;
	this.emit('added', client);
	client.on('disconnect', this._on_client_disconnect);
};
	
proto.remove = function(client){
	delete this.list[client.sessionId];
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
	var except_client, only;
	if(options){
		if(options.meta_data) // options is a Client to except
			except_client = options;
		else{
			only = options.only;
			if(options.first){
				options.first.send(msg);
				except_client = options.first;
			}
		}
	}
	var list = this.list;
	for(var id in list){
		var client = list[id];
		if(except_client && (except_client == client)) continue;
		if(only && !only(client)) continue;
		client.send(msg);
	}
};

function ClientPoolStats(clientPool){
	var self = this;
	this.max = clientPool.count;
	this.clientPool = clientPool;
	
	clientPool.on('added', function(){
		if(clientPool.count > self.max)
			self.max = clientPool.count;
	})
}

ClientPoolStats.prototype.reset = function(){
	this.max = clientPool.count;
}

exports.ClientPool = ClientPool;
exports.ClientPoolStats = ClientPoolStats;
