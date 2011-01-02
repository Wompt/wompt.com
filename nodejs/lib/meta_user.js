var wompt = require("./includes");

function MetaUser(doc){
	this.clients = new wompt.ClientPool();
	this.doc = doc;
	this.visible = !!doc;
	this.readonly = !doc;
	this.touch();
};


MetaUser.prototype.touch = function(){
	this.touched = new Date();
}


module.exports = MetaUser