var Util = require('../lib/util'),
node_util = require('util'),
assert = require('assert'),
vows = require('wompt_dependencies').vows;

var suite = vows.describe('Util module');

suite.addBatch({
	'Util.merge for single-level merges':{
		topic: function(){
			return {
				a: 1,
				b: "two",
				c: {three:true}
			}
		},
		
		'with an empty target': function(original){
			var empty = {};
			var merged = Util.merge(empty, original);
			
			// Equal keys/values
			assert.deepEqual(original, merged);
			
			// Not the same object
			assert.notEqual(original, merged);
			
			// Same object
			assert.strictEqual(empty, merged);
		}
	}
}).export(module);
