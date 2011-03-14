var fs = require('fs');

function AppStateLogger(options){
	var log = fs.createWriteStream(options.path, {flags:'a'});
	
	this.connectToMonitor = function(monitor){
		monitor.on('new_state', writeState);
	}
	
	function writeState(state){
		log.write(state.t + ':' + JSON.stringify(state) + "\n");
	}

	if(options.monitor) 
		this.connectToMonitor(options.monitor);
}

module.exports = AppStateLogger;
