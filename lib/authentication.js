var wompt = require("./includes")

function Auth(){
	this.find_user = function(method, data){
		return new wompt.User({name: 'Fred'});
	}
}

exports.Auth = new Auth();
