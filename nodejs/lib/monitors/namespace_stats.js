var util = require('util'),
    wompt = require('../includes'),
    async = wompt.dependencies.async;

function NamespaceStatsPreparer(channelManager){
	this.roomManager = channelManager;
	this.stats = {
		day:    new wompt.ClientPoolStats(this.roomManager),
		hour:   new wompt.ClientPoolStats(this.roomManager),
		minute: new wompt.ClientPoolStats(this.roomManager)
	}

	var monitors = {
		connections        : connections
		,peak_connections  : peakConnections
		,t                 : timeStamp
	};

	this.prepare = function(frequency, done){
		var stats = this.stats[frequency];
		async.parallel(monitors, function(err, results){
			stats.reset();
			done(err, results);
		});
	
		function connections(done){
			done(null, stats.clients.count);
		}
		
		function peakConnections(done){
			done(null, stats.max);
		}
		
		function timeStamp(done){
			done(null, new Date());
		}
	}
}


function NamespaceStatsMonitor(channelManager, options){
	var namespaceStats = new NamespaceStatsPreparer(channelManager);

	var self = this;
	
	if(!options.disabled)
		this.timer = setInterval(tick, options.interval);
	
	function tick(){
		namespaceStats.prepare(function(result){
			me.emit('new_state', result);
			me.previousState = result;
		})
	}
}

util.inherits(NamespaceStatsMonitor, require('events').EventEmitter);


module.exports = NamespaceStatsMonitor;
