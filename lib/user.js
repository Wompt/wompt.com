var wompt = require("./includes");

function User(attributes){
	this.clients = new wompt.ClientPool();
	this.attributes = attributes;
}

User.find_by_token = function(token){
	var possible_names = ['Dave', 'Larry', 'Suzie', 'Dagny', 'Ellen', 'Aaron'];
	
	return new User({
		name: possible_names[Math.floor(Math.random()*possible_names.length)]
	});
}

exports.User = User;
