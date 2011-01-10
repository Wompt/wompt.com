var EventEmitter = require('events').EventEmitter;

function ClientPool(){
	var list = {};
	var client_pool = this;
	this.list = list;
	this.count = 0;
	
	//called in the context of the client (this = client)
	this._on_client_disconnect = function(){
		client_pool.remove(this);
	}
}

var proto = ClientPool.prototype = new EventEmitter();;

proto.add = function(client){
	this.list[client.sessionId] = client;
	this.count++;
	this.emit('added', client);
	client.on('disconnect', this._on_client_disconnect);
};
	
proto.remove = function(client){
	delete this.list[client.sessionId];
	this.count--;
};

proto.each = function(iter){
	var list = this.list;
	for(var id in list){
		iter(list[id], id);
	}
}


proto.broadcast = function(msg, options){
	var except_client, only;
	if(options){
		if(options.meta_data)
			except_client = options;
		else
			only = options.only;
	}
	var list = this.list;
	for(var id in list){
		var client = list[id];
		if(except_client && (except_client == client)) continue;
		if(only && !only(client)) continue;
		client.send(msg);
	}
};

exports.ClientPool = ClientPool;
