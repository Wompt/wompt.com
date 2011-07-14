var W = require('./test_helper'),
Util = require('../lib/util'),
assert = W.assert,
vows = W.vows;

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
		},
		
		'with a populated target': function(original){
			var populated = {
				d: "four"
			};
			var merged = Util.merge(populated, original);
			
			// keys/values
			assert.equal(populated.d, merged.d);
			delete populated.d;
			assert.deepEqual(original, merged);
						
			// Not the same object
			assert.notEqual(original, merged);
			
			// Same object
			assert.strictEqual(populated, merged);
		},
		
		'with a target that wil be overwritten': function(original){
			var obj = {four: true},
			target = {
				c: obj
			};
			var merged = Util.merge(target, original);
			
			// keys/values
			assert.notDeepEqual(obj, merged.c);
			assert.deepEqual(original, merged);
		}
	},
	
	'Util.mergeDeep':{
		topic: function(){
			return {
				a: 1,
				b: "two",
				c: {
					three:true
				}
			}
		},
		
		'with an empty target': function(original){
			var target = {};
			var merged = Util.mergeDeep(target, original);
			
			// Equal keys/values
			assert.deepEqual(original, merged);
			
			// Not the same object
			assert.notEqual(original, merged);
			
			// Same object
			assert.strictEqual(target, merged);
		},
		
		'with a nested objects that will be merged': function(original){
			var c = {four: true},
			target = {
				c: c
			};
			var merged = Util.mergeDeep(target, original);
			
			// keys/values
			assert.equal(c.four, merged.c.four);
			assert.deepEqual({three:true, four:true}, merged.c);
		}
	}	
}).export(module);
