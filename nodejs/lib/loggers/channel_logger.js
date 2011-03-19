var fs = require('fs'),
    env = require('../../environment');

function ChannelLogger(channel){
	this.channel = channel;
	var self = this;
	this.openFile();
	channel.on('msg', function(msg){
		self.logMessage(msg)
	});
}

var proto = ChannelLogger.prototype;

proto.openFile = function(){
	this.filePath = env.logs.channels.root + '/' + this.sanitizeChannelName() + ".log";
	this.log = fs.createWriteStream(this.filePath, {flags:'a'});
}

proto.sanitizeChannelName = function(){
	var name = this.channel.name.toLowerCase();
	return name;
}

proto.logMessage = function(msg){
	this.log.write(msg.t + ':' + JSON.stringify(msg) + "\n");
}

module.exports = ChannelLogger;
