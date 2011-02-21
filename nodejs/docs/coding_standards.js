var util = require('util');

// Functions which are meant to be instantiated should be CamelCased
function ClassName(){
	// public variables are lowerCamelCase
	this.publicVaraible = true;
	
	// private variables use_underscores
	var private_variable;
	
	// same with private functions
	function private_function(){
		
	}
	
	// public functions that need access to private variables
	// try to limit or remove these if your object will be instantiated many times
	// as each object will store a reference to a function, instead of once per
	// class
	this.publicFunction = function(){
		
	}
}

// If you need your module to emit events
util.inherits(ClassName, require('events').EventEmitter);

var proto = ClassName.prototype;

// functions should have lowercaseThenUppercase() function names
proto.publicFunction = function(){
	
}


// if it's a Singleton
module.exports = new ClassName();

// if it's meant to be instantiated
module.exports = ClassName;

// if you want export more than one thing
module.exports = {
	ClassName: ClassName,
	SomethingElse: SomethingElse
}
