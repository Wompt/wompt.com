
function Channel(config){
	this.name = config.name;
	this.message_count = 0;
	this.messages = [];
	this.sessions = {};
}

Channel.prototype = {
	process_request: function(con){
		this.message_count++;
		con.res.writeHead(200);
		con.res.end("I'm channel: " + this.name + " this is message #" + this.message_count + "\n");
	}
}

exports.Channel = Channel;
