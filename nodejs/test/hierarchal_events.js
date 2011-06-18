var hevents = require('../lib/heirarchial_events'),
util = require('util'),
vows = require('wompt_dependencies').vows;


var suite = vows.describe('Heirarchical Events');

suite.addBatch({
	'normal events':{
		topic: function(){ return new EventEmitter() }
		'': function(){
			
		}
	}
}).run();
