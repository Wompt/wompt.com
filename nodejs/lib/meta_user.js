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


MetaUser.prototype.touch = function(){
	this.touched = new Date();
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
}

module.exports = MetaUser
