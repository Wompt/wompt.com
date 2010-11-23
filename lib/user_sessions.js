function UserSessions(){
	var CLEANUP_INTERVAL    = 10 * 1000,
	    REQUEST_EXPIRE      = 10 * 1000;
	
	
	var sessions = this.sessions = {};
	// Always sorted from oldest to newest (new one are added to the end)
	var sorted_sessions = this.sorted_sessions = [];
	
		
	function cleanup_expired_sessions(){
		var i = 0,
		    expire_time = new Date() - REQUEST_EXPIRE;
		
		while(i < sorted_sessions.length && sorted_sessions[i].t < expire_time)
			{ i++ }
			
		if(i > 0){
			var removed = sorted_sessions.splice(0, i);
			removed.forEach(function(session){
				delete sessions[session.id];
			});
		}
	}
	
	this.timer = setInterval(cleanup_expired_sessions, CLEANUP_INTERVAL);	
}

UserSessions.prototype = {
	add: function(session){
		this.sessions[session.id] = session;
		this.sorted_sessions.push(session);
	},
	
	get: function(id){
		return this.sessions[id];
	}
}

module.exports = UserSessions;