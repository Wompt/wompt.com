var util = require('util'),
events = require('events');

var MAX_ERROR_MS = 20;

function Cron(){
	var self = this,
	callbackLists = {},
	stoppers = {};

	// Returns a unique ID that you can pass to .stop(ID)
	// interval = 'second' | 'minute' | 'hour' | 'day'
	this.onThe = function onThe(interval, cb){
		var list = getOrCreateCallbackList(interval);
		var id = Math.random().toString();
		list[id] = cb;
		return id;
	}

	// Stops calling the callback identified by the passed ID
	// Actual timers are stopped once the last callback has been stopped.
	this.clear = function(id_to_stop){
		for(var interval in callbackLists){
			var empty = true,
			list = callbackLists[interval];
			
			for(var id in list){
				if(id == id_to_stop){
					delete list[id];
				} else {
					empty = false;
				}
			}
			
			if(empty){
				stopInterval(interval)
			}
		}
	}
	
	function registerInterval(frequency, cb){
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
		
		callbackLists[frequency]
		stoppers[frequency] = function(){
			clearInterval(interval);
			clearTimeout(timeout);
		};
	}
	
	function stopInterval(interval){
		delete callbackLists[interval];
		var stopper = stoppers[interval]();
		if(stopper){
			stopper()
			delete stoppers[interval];
		}
	}

	
	function getOrCreateCallbackList(interval){
		if(callbackLists[interval]) return callbackLists[interval];
		
		var list = callbackLists[interval] = {};
		registerInterval(interval, function(){
			for(var id in list){
				list[id]();
			}
		});
		
		return list;
	}
}

util.inherits(Cron, events.EventEmitter);

Cron = new Cron();

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