var fs = require('fs'),
Channel = require('../channel').Channel,
Hoptoad = require('../hoptoad'),

env = require('../../environment');

var MAX_PRELOAD_BYTES = 1024 * 8;

if(!env.logs.channels.disabled)
	fs.mkdir(env.logs.channels.root, 0666, Hoptoad.notifyCallback);

if(!Channel.prototype.send_initial_data) throw "Channel.send_initial_data function no longer exists - need to refactor channel logger!";

function ChannelLogger(channel){
	this.channel = channel;
	this._suspendChannel();
	var self = this;
	this.openFile();
	channel.on('msg', function(msg){
		self.logMessage(msg)
	});
}

var proto = ChannelLogger.prototype;

proto._suspendChannel = function(){
	var chan = this.channel;
	chan.bufferedParameters = [];
	
	chan.send_initial_data = function(){
		chan.bufferedParameters.push(Array.prototype.slice.call(arguments));
	}
}

proto._onLogLoaded = function(msgs){
	var chan = this.channel;
	
	if(msgs) chan.messages.prepend(msgs);
	var send = Channel.prototype.send_initial_data;

	chan.bufferedParameters.forEach(function(args){
		send.apply(chan, args);
	});

	delete chan.send_initial_data;
	delete chan.bufferedParameters;
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
		if(!err){
			lines = buf.toString('utf8').split("\n");
			// We read the file in an arbitrary spot, so the first line is likely only half there
			lines.shift();
			msgs = lines.map(function(line){
				var p = line.indexOf(':');
				if(p > 0) return JSON.parse(line.substr(p+1));
				else return null;
			}).filter(function(m){return m != null});
		}
		self._onLogLoaded(msgs);
	}
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
		else self._onExistingFile(stat.size);
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
