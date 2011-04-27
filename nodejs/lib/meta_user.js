var wompt = require("./includes");

function MetaUser(doc){
	var me = this;
	this.clients = new wompt.ClientPool();
	this.doc = doc;
	this.visible = !!doc;
	this.readonly = !doc;
	this.touch();
	
	this.clients.on('added', function(client){
		me.clients.broadcast({
			action: 'new_client',
			channel: client.meta_data.channel.name
		},client);
	});	
};


MetaUser.prototype.id = function(){
	return this.doc ? this.doc._id.toJSON() : null;
}

MetaUser.prototype.touch = function(){
	this.touched = new Date();
}

MetaUser.prototype.authenticated = function(){
	return !!this.doc;
}

MetaUser.prototype.authentication_for = function(provider){
	return this.doc && this.doc.authentication_for(provider);
}

MetaUser.prototype.new_session = function(session){
	this.clients.broadcast({
		action: 'new_session'		
	});
}

MetaUser.prototype.end_session = function(session){
	this.clients.broadcast({
		action: 'end_session'
	});
	this.clients.each(function(client, index){
		if(client.meta_data && client.meta_data.token == session.token)
			client._onDisconnect();
	});
}

module.exports = MetaUser
