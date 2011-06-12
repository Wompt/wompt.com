var Util = exports || {},
crypto = require('crypto'),
fs = require('fs');

Util.mergeDeep = function (A, B, depth) {
	var forever = depth == null;
	for (var p in B) {
		if (B[p] != null && B[p].constructor==Object && (forever || depth > 0)) {
			A[p] = Util.mergeDeep(
				A.hasOwnProperty(p) ? A[p] : {},
				B[p],
				forever ? null : depth-1
			);
		} else {
			A[p] = B[p];
		}
	}
	return A;
}

Util.merge = function(A, B) {
	return Util.mergeDeep(A, B, 0);
}

Util.mergeCopy = function(A, B, depth) {
	var A_copy = Util.mergeDeep({}, A);
	return Util.mergeDeep(A_copy, B, depth);
}

Util.chop = function(str){
	str = str.toString();
	if(str.length == 0) return str;
	return str.substr(0, str.length - 1);
}

Util.md5 = function(str){
	return crypto.createHash('md5').update(str).digest("hex");
}

Util.fs = {
	fileExists: function(path, callback){
		fs.stat(path, function(err, stat){
			var exists = !!err;
			callback(exists && stat);
		});
 	},
	
	readFile: function(path, callback){
		fs.readFile(path, function(err, data){
			var exists = !!err;
			callback(data, exists);
		});
 	}
};

// Allows easy setup of a chain of connect-style middlewares
// given:
// function A(req,res,next)
// function B(req,res,next)
// stackMiddleware(A,B) will return a function(req,res,next) that passes the request
// through both handlers,  just like Connect. If a next is called with an error
// the call chain is stopped and the error is passed to the original next()
Util.stackMiddleware = function stackMiddleware(){
	var layers = Array.prototype.slice.call(arguments,0);
	len = layers.length;
		
	var handler = function(req,res,next){
		var i = 0;
		
		function nextLayer(err){
			if(err)	return next(err);
			if(i < len){
				var layer = layers[i++];
				layer(req, res, nextLayer);
			}
		}
		
		nextLayer();
	}
	
	return handler;
}

// Shortcut to curry the stackMiddleware function
Util.preStackMiddleware = function preStackMiddleware(){
	var layers = Array.prototype.slice.call(arguments,0);
	return Util.curry(Util.stackMiddleware, layers);
}

// applies arguments
Util.curry = function(fn, args){
	return function(){
		return fn.apply(this, args.concat(Array.prototype.slice.call(arguments,0)));
	}
}

