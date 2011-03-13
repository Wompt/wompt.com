var util = require('util');

var DEFAULTS = {
	 interval: 5 * 60 * 1000
};

function AppStatePreparer(app){
	
	this.prepare = function(){
		var out = {};
		for(var key in monitors){
			out[key] = monitors[key](app);
		}
		return out;
	}
	
	var monitors = {
		clients: clientCounts
		,t: timeStamp
	};

	function clientCounts(){
		return {
			count: app.clients.count
		}
	}
	
	function timeStamp(){ return new Date().getTime(); }
}


function AppStateMonitor(app, options){
	var appState = new AppStatePreparer(app);
	
	options = options || DEFAULTS;
	
	var me = this;
	
	this.timer = setTimeout(tick, options.interval || DEFAULTS.interval);
	
	function tick(){
		me.emit('new_state', appState.prepare());
	}
}

util.inherits(AppStateMonitor, require('events').EventEmitter);


module.exports = AppStateMonitor;
