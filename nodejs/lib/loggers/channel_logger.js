var fs = require('fs'),
Channel = require('../channel').Channel,
Hoptoad = require('../hoptoad'),
env = require('../../environment');

if(!env.logs.channels.disabled)
	fs.mkdir(env.logs.channels.root, 0666, Hoptoad.notifyCallback);

function ChannelLogger(channel){
	this.channel = channel;
	var self = this;
	this.openFile();
	channel.on('msg', function(msg){
		self.logMessage(msg)
	});
}

var proto = ChannelLogger.prototype;

proto._onNewFile = function(){
	var info = {
		name: this.channel.name,
		created: new Date().getTime()
	}
	this.log.write("//" + JSON.stringify(info) + "\n");
}

proto._onLoad = function(){
	var log = this.log;
	this.buffer.forEach(function(line){
		log.write(line);
	});
	delete this.buffer;
	this.loaded = true;
}

proto.openFile = function(){
	var self = this;
	this.filePath = env.logs.channels.root + '/' + this.hashChannelName() + ".log";
	this.log = fs.createWriteStream(this.filePath, {flags:'a'});
	this.loaded = false;
	this.buffer = [];

	fs.stat(this.filePath, function(err, stat){
		if(err || stat.size == 0) self._onNewFile();
		self._onLoad();
	});
}

proto.hashChannelName = function(){
	return Channel.hashName(Channel.generalizeName(this.channel.name));
}

proto.logMessage = function(msg){
	var line = msg.t + ':' + JSON.stringify(msg) + "\n";
	if(this.loaded)
		this.log.write(line);
	else
		this.buffer.push(line);
}

module.exports = ChannelLogger;
