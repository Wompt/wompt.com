
function Session(user, channel, res){
	this.user = user;
	this.channel = channel;
	this.id = Math.floor(Math.random()*99999999999).toString();
	this.res = res;
}

Session.prototype = {
	push_message: function(msg){
		this.res.json(200, {msg: msg});
		delete this.res;
	}
}

exports.Session = Session;
