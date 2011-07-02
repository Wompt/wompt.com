var util = require('util'),
    wompt = require('../includes'),
    Cron = require('../cron'),
    async = wompt.dependencies.async;

function NamespaceStatsPreparer(channelManager){
	this.roomManager = channelManager;
	var stats = this.stats = new wompt.ClientPoolStats(this.roomManager.clients);

	var monitors = {
		connections        : connections
		,peak_connections  : peakConnections
		,t                 : timeStamp
		,msgs_in           : messagesIn
		,msgs_out          : messagesOut
	};

	this.prepare = function(done){
		async.parallel(monitors, function(err, results){
			results.t = new Date();
			stats.reset();
			done(err, results);
		});
	}
	
	function connections(done){
		done(null, stats.clients.count);
	}
	
	function peakConnections(done){
		done(null, stats.max);
	}
	
	function timeStamp(done){
		done(null, new Date());
	}
	
	function messagesOut(done){
		done(null, stats.msgs_out);
	}

	function messagesIn(done){
		done(null, stats.msgs_in);
	}
}

// Emits "stats" events at regular intervals and passes an object with statistics
// about the provided channelManager
//
// options = {
// 	intervals: ['minute', 'hour', 'day'] -- any combination of these
// 	disabled: true/false  (optional)
// }
function NamespaceStatsMonitor(channelManager, options){
	var self = this,
	stats = {};
	
	options = wompt.util.merge({intervals:[]}, options);
	
	if(options.disabled) return;
	
	options.intervals.forEach(function(interval){
		stats[interval] = new NamespaceStatsPreparer(channelManager);
		var ticker = createTicker(interval, stats[interval]);
		Cron.onThe(interval, ticker);
	});
	
	function createTicker(interval, statsPreparer){
		return function(){
			statsPreparer.prepare(function statsComplete(err, result){
				self.emit('stats', interval, result);
				self.previousState = result;
			})
		}
	}
}

util.inherits(NamespaceStatsMonitor, require('events').EventEmitter);


module.exports = NamespaceStatsMonitor;
