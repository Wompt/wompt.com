var wompt  = require("./includes");

function Channel(config){
	this.name = config.name;
	this.messages = new wompt.MessageList();
	this.sessions = {};
}

Channel.prototype = {
	process_request: function(con){
		var action = con.req.parts[3].split('?', 2);
		con.action = action[0];
		con.query = action[1];
		this.action_responders[con.action].call(this, con);
	},
	
	action_responders: {
		recv: function(con){
			var session = this.create_session(con.res);
			this.sessions[session.id] = session;
		},
		
		post: function(con){
			var msg = con.req.query.split('=',2)[1];
			this.push_message(msg)
			con.res.json(200, {})
		}
	},
	
	push_message: function(msg){
		this.messages.add_message(msg);
		this.inform_sessions(msg);
	},
	
	inform_sessions: function(msg){
		for(var id in this.sessions){
			var session = this.sessions[id];
			wompt.logger.log("Sending " + msg + " to client " + id);
			session.push_message(msg);
		}
		this.sessions = {};
	},
	
	create_session: function(res){
		return new wompt.Session(null, this, res);
	}
}

exports.Channel = Channel;
