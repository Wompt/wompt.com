var utils = require('./util'),
    util = require("util"),
    events = require("events");
		
function Expirer(collection, options){
	var defaults = {
			expire_after_ms: 10 * 60 * 1000,
			time_attribute: 'touched'
		},
		me = this,
		timer;
		
	options = utils.merge(defaults, options || {});
	options.cleanup_interval = options.check_interval || options.expire_after_ms;
	
	function check_expiration(){
		var i = 0,
		    expire_time = new Date() - options.expire_after_ms,
				time_attr = options.time_attribute,
				keep_if = options.keep_if;
		
		for(var k in collection){
			var obj = collection[k];
			if(obj[time_attr] < expire_time && !(keep_if && keep_if(obj))){
				me.emit('expired', obj);
				delete collection[k];
			}
		}
	}
	
	this.pause = function(){
		if(timer) clearInterval(timer);
	}
	
	this.start = function(){
		if(!timer) timer = setInterval(check_expiration, options.cleanup_interval);	
	}

	this.start();
}

util.inherits(Expirer, events.EventEmitter);


module.exports = Expirer;