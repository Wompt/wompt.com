var wompt = require("./includes");

function MetaUser(doc){
	var me = this;
	this.clients = new wompt.ClientPool();
	this.doc = doc;
	this.visible = !!doc;
	this.readonly = !doc;
	this.touch();
};


MetaUser.prototype.touch = function(){
	this.touched = new Date();
}

MetaUser.prototype.new_session = function(session){
	this.clients.broadcast({
		action: 'new_session'		
	});
}

module.exports = MetaUser
