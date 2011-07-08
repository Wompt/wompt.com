function RateLimiter(allowed, within){
	var events = [];
	
	return {
		another: function(){
			var now = Date.now();
			if(events.length >= allowed && (now - events[0]) < within)
				return false;
			
			events.push(now);
			if(events.length > allowed)
				events.shift();
				
			return true;
		},
		
		allowed: allowed,
		within: within
	}
}

module.exports = RateLimiter;
