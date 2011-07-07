var W = require('./test_helper'),
Limiter = require('../lib/rate_limit.js'),
assert = W.assert,
vows = W.vows;

var suite = vows.describe('Rate Limiting Module');

suite.addBatch({
	'Single event limiting':{
		topic: createLimiter(1, 100).limit,
		
		'should limit succesive events': function(limiter){
			var good = limiter.another();
			assert.isTrue(good);
			assert.isFalse(limiter.another());
		}
	}
}).export(module);

function createLimiter(count, span){
	return {
		limit: Limiter(count, span),
		count: count,
		span: span
	}
}
