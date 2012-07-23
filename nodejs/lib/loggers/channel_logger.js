var fs = require('fs'),
Channel = require('../channel').Channel,
Hoptoad = require('../hoptoad'),
wompt = require('../includes'),
env = require('../../environment');

var MAX_PRELOAD_BYTES = 1024 * 32;

if(!env.logs.channels.disabled)
	fs.mkdir(env.logs.channels.root, 0775, Hoptoad.notifyCallback);

if(!Channel.prototype.send_initial_data) throw "Channel.send_initial_data function no longer exists - need to refactor channel logger!";

function ChannelLogger(channel, subdirectory){
	this.channel = channel;
	this.subdirectory = subdirectory;
	this.buffer = [];
	
	this._suspendChannel();
	
	var self = this;
	channel.on('msg', function(msg){
		self.logMessage(msg)
	});
	channel.on('destroy', function(){
		self.destroy();
	});
	
	if(!env.logs.channels.disabled){
		wompt.util.fs.makeDirs(env.logs.channels.root, this.subdirectory, 0775, function(err){
			if(err)
				Hoptoad.notifyCallback(err);

			self.openFile();
		});
	}
}

var proto = ChannelLogger.prototype;

proto._suspendChannel = function(){
	var chan = this.channel;
	chan.bufferedParameters = [];
	
	// Hide the default implementation (which is in Channel.prototype) with this
	// version that buffers the calls
	chan.send_initial_data = function(){
		chan.bufferedParameters.push(Array.prototype.slice.call(arguments));
	}
}

proto._resumeChannel = function(){
	var chan = this.channel;
	var send = Channel.prototype.send_initial_data;

	chan.bufferedParameters.forEach(function(args){
		send.apply(chan, args);
	});

	// This only deletes OUR buffered implementation of send_initial_data,
	// the real one exists in Channel.prototype
	delete chan.send_initial_data;
	delete chan.bufferedParameters;
}

// Called when the existing log is loaded, if it doesn't exist, this is called
// without any arguments
proto._onLogLoaded = function(msgs){
	if(msgs) this.channel.messages.prepend(msgs);
	this._resumeChannel();
	this._onReadyForWriting();
}

proto._onNewFile = function(){
	var info = {
		name: this.channel.name,
		created: new Date().getTime()
	}
	this.log.write("//" + JSON.stringify(info) + "\n");
	this._onLogLoaded();
}

proto._onExistingFile = function(size){
	var read_size = Math.min(size, MAX_PRELOAD_BYTES),
	    self = this,
	    buf;

	fs.open(this.filePath, 'r', null, opened);
	
	function opened(err, fd){
		if(err) return self._onLogLoaded();
		buf = new Buffer(read_size);
		fs.read(fd, buf, 0, read_size, size - read_size, done_reading);
	}
	
	function done_reading(err, bytesRead){
		var msgs;
		if(!err){
			lines = buf.toString('utf8').split("\n");
			// We read the file in an arbitrary spot, so the first line is likely only half there
			lines.shift();
			msgs = lines.map(function(line){
				var p = line.indexOf(':');
				if(p > 0) {
					var msg = JSON.parse(line.substr(p+1));
					if (msg.msg) {
						msg.msg = '' + msg.msg;
					}
					return msg;
				}
				else return null;
			}).filter(function(m){return m != null});
		}
		self._onLogLoaded(msgs);
	}
}

proto._onReadyForWriting = function(){
	var log = this.log;
	this.buffer.forEach(function(line){
		log.write(line);
	});
	delete this.buffer;
	this.loaded = true;
}

proto.openFile = function(){
	var self = this;
	this.filePath = this.baseDirectory() + '/' + this.hashChannelName() + ".log";
	this.log = fs.createWriteStream(this.filePath, {flags:'a'});
	this.loaded = false;

	fs.stat(this.filePath, function(err, stat){
		if(err || stat.size == 0) self._onNewFile();
		else self._onExistingFile(stat.size);
	});
}

proto.baseDirectory = function(){
	var dir = env.logs.channels.root;
	if(this.subdirectory)
		dir += '/' + this.subdirectory;
	return dir;
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

proto.destroy = function(){
	if(this.log)
		this.log.destroySoon();
	delete this.channel;
	delete this.log;
}

module.exports = ChannelLogger;
