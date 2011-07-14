var W = require('./test_helper'),
Limiter = require('../public/js/rate_limit.js'),
assert = W.assert,
vows = W.vows;

var suite = vows.describe('Rate Limiting Module');

suite.addBatch({
	'Limiting to 1 event':{
		topic: limiterFactory(1, 100),
		
		'should deny more than 1 sequential event': testSequential,
		'should deny': testOverLimit(),
		'should allow': testUnderLimit()
	},
	
	'Limiting to n events':{
		topic: limiterFactory(10, 100),
		
		'should deny too many sequential events': testSequential,
		'should deny': testOverLimit(),
		'should allow': testUnderLimit()
	},
	
	'Limiting to n events on a short interval':{
		topic: limiterFactory(5, 50),
		
		'should deny too many sequential events': testSequential,
		'should deny': testOverLimit(),
		'should allow': testUnderLimit()
	}
}).export(module);


function limiterFactory(allowed, within){
	return function(){
		return function(){ return Limiter(allowed, within); }
	}
}

function testSequential(factory){
	var limiter = factory();
	
	soakGoodEvents(limiter);
	assert.isFalse(limiter.another());
}

function testOverLimit(){
	return {
		topic: function(factory){
			var limiter = factory(),
			callback = this.callback;

			soakGoodEvents(limiter);
			
			setTimeout(function(){
				callback(null, limiter);
			}, limiter.within / 2);		
		},
		
		'too many events': {
			topic: function(limiter){return limiter;},
			
			'within the time span': function(limiter){
				assert.isFalse(limiter.another());
			},
			
			'but be': goodAfterSpan()
		}
	}
}

function testUnderLimit(){
	return {
		topic: function(factory){
			var limiter = factory(),
			callback = this.callback;
			
			soakGoodEvents(limiter);
				
			setTimeout(function(){
				callback(null, limiter);
			}, limiter.within * 2);		
		},
		
		'events after the time span': function(limiter){
			assert.isTrue(limiter.another());
		}		
	}
}

function goodAfterSpan(){
	var context = {
		topic: function(limiter){
			assert.isFalse(limiter.another());
			var callback = this.callback;
				
			setTimeout(function(){
				callback(null, limiter);
			}, limiter.within);		
		}
	}
	
	context['good after the span'] = function(limiter){
		assert.isTrue(limiter.another());
	}
	
	return context;
}

function soakGoodEvents(limiter){
	for(var i=limiter.allowed; i--;)
		assert.isTrue(limiter.another());
}