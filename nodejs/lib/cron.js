var MAX_ERROR_MS = 20;

function Cron(){
	var timmy = [], self = this;
	
	this.every = function(frequency, cb){
		var interval, timeout, nextTime;
		scheduleIntervalSoonest();
		
		// Schedule the interval to start at the next time slot i.e. round(current) + 1
		function scheduleInterval(){
			calculateNextTime();
			timer = setTimeout(startInterval, nextTime - Date.now());
		}
		
		// Schedule the interval to start at the soonest time slot i.e. floor(current) + 1
		function scheduleIntervalSoonest(){
			calculateNextTime('floor');
			timer = setTimeout(startInterval, nextTime - Date.now());
		}
		
		function startInterval(){
			calculateNextTime();
			interval = setInterval(checkAndExecute, Cron.time.distanceInMs(frequency));
			cb()
		}
		
		function calculateNextTime(round_func){
			nextTime = Cron.time.roundToNext(frequency, null, round_func).getTime();
		}
		
		function checkAndExecute(){
			var cur = Date.now();
			var oldNext = nextTime;
			calculateNextTime();
			if(Math.abs(oldNext - cur) > MAX_ERROR_MS){
				console.log(" =======  Rescheduling: " + (oldNext - cur));
				clearInterval(interval);
				scheduleInterval();
			}
			
			cb();
		}
		
		return {stop: function(){
			clearInterval(interval);
			clearTimeout(timeout);
		}};
	}
}

Cron.math = {
	round: function round(num, divisor){
		return Math.round(num / divisor) * divisor;
	},

	ceil: function round(num, divisor){
		return Math.ceil(num / divisor) * divisor;
	},

	floor: function round(num, divisor){
		return Math.floor(num / divisor) * divisor;
	}
}

Cron.time = {
	distanceInMs: function(length){
		var t = 1;
		switch(length){
			case 'day':	   return 1000 * 60 * 60 * 24;
			case 'hour':   return 1000 * 60 * 60;
			case 'minute': return 1000 * 60;
			case 'second': return 1000;
		}
	},
	
	beginningOf: function beginningOf(t, part){
		switch(part){
			case 'day':	   t.setUTCHours(0);
			case 'hour':   t.setUTCMinutes(0);
			case 'minute': t.setUTCSeconds(0);
			case 'second': t.setUTCMilliseconds(0);
		}
	},
	
	roundToNext: function roundToNext(period, start, round_func){
		var t = start || new Date();
		round_func = Cron.math[round_func || 'round'];
		
		switch(period){
			case 'second':
				t.setUTCMilliseconds(round_func(t.getUTCMilliseconds(), 1000) + 1000);
				break;
			case 'minute':
				t.setUTCSeconds(round_func(t.getUTCSeconds(), 60) + 60);
				this.beginningOf(t, 'minute');
				break;
			case 'hour':
				t.setUTCMinutes(round_func(t.getUTCMinutes(), 60) + 60);
				this.beginningOf(t, 'hour');
				break;
			case 'day':
				t.setUTCHours(round_func(t.getUTCHours(), 24) + 24);
				this.beginningOf(t, 'day');
				break;			
		}
		return t;
	}
}

module.exports = Cron;