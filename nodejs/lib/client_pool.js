
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

var proto = ClientPool.prototype;

proto.add = function(client){
	this.list[client.sessionId] = client;
	this.count++;
	client.on('disconnect', this._on_client_disconnect);
};
	
proto.remove = function(client){
	delete this.list[client.sessionId];
	this.count--;
};

proto.broadcast = function(msg, except){
	var list = this.list;
	for(var id in list){
		var client = list[id];
		if(except == client) continue;
		client.send(msg);
	}
};

exports.ClientPool = ClientPool;
