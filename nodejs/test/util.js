var Util = require('../lib/util'),
node_util = require('util'),
vows = require('wompt_dependencies').vows;

var suite = vows.describe('Util module');

suite.addBatch({
	'Util.merge':{
		topic: function(){ return blah; },
		'blah': function(){
			
		}
	}
}).run();
