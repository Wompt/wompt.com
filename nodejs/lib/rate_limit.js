var Util = require("./util");

function RateLimiter(count, span){
	var events = [];
	
	return {
		another: function(){
			var now = Date.now();
			if(events.length > 0 && (now - events[0]) < span)
				return false;
			
			events.push(now);
			if(events.length > count)
				events.pop();
				
			return true;
		}
	}
}

module.exports = RateLimiter;