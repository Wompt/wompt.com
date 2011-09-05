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
	if(!str) return str;
	str = str.toString();
	if(str.length == 0) return str;
	return str.substr(0, str.length - 1);
}

var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split('');
Util.randomString = function(len) {
    var result = [];
    for (var i=0; i<len; i++) {
        var index = Math.floor(Math.random() * chars.length);
        result.push(chars[index]);
    }
    return result.join('');
}

Util.md5 = function(str){
	return crypto.createHash('md5').update(str).digest("hex");
}

Util.sha1 = function(str){
	return crypto.createHash('sha1').update(str).digest("hex");
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
 	},
	
	makeDirs: function(sure_part, unsure_part, mode, callback){
		var dirs = unsure_part.split('/');
		var currentDir = sure_part;
		
		function makeNextDir(){
			currentDir += '/' + dirs.shift();
			fs.mkdir(currentDir, mode, function(err){
				if(err && err.code != 'EEXIST') return callback(err);
				if(dirs.length > 0)
					makeNextDir();
				else
					callback();
			});
		}
		makeNextDir();
	}
};

// Allows easy setup of a chain of connect-style middlewares
// given:
// function A(req,res,next)
// function B(req,res,next)
// stackMiddleware(A,B) will return a function(req,res,next) that passes the request
// through both handlers,  just like Connect. If a next() is called with an error
// the call chain is stopped and the error is passed to the original next()
// If next() is called with the second parameter set to 'break' "next(null, 'break')"
// The chain is halted and route control is passed back to the original next()
Util.stackMiddleware = function stackMiddleware(){
	var layers = Array.prototype.slice.call(arguments);
		
	var handler = function(req,res,next){
		var i = 0;
		
		// This is passed as the next() parameter
		function nextLayer(err, escapeStack){
			if(err)	return next(err);
			// if the second param is 'break', break out of this stack by calling
			// the original next()
			if(escapeStack == 'break') return next();
			
			// if there are still layers left
			if(i < layers.length){
				var layer = layers[i++];
				layer(req, res, nextLayer);
			} else next(); // we're done with the stack.
		}
		
		nextLayer();
	}
	
	return handler;
}

// Shortcut to curry the stackMiddleware function
Util.preStackMiddleware = function preStackMiddleware(){
	var layers = Array.prototype.slice.call(arguments);
	return Util.curry(Util.stackMiddleware, layers);
}

// applies arguments
Util.curry = function(fn, args){
	return function(){
		return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
	}
}

// Splits the url by '/'
// stores it in req._url_parts
Util.urlParts = function (req){
	if(req._url_parts) return req._url_parts;
	
	return req._url_parts = req.url.split('/');
}
