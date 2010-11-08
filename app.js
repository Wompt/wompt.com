var http   = require("http"),
    url    = require("url"),
    wompt  = require("./includes"),
    logger = wompt.logger;
		

function App(){
	this.channels = [];
	this.sessions = {};
}

App.prototype = {
	
}

exports.App = App;
