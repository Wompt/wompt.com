var wompt = require("./includes");

function User(attributes){
	this.clients = new wompt.ClientPool();
	this.attributes = attributes;
}

/*
User.prototype = {

}
*/
exports.User = User;
