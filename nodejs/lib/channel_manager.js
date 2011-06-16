var wompt  = require("./includes")
   ,Channel = wompt.Channel
   ,events = require("events")
   ,util = require("util");

function ChannelManager(options){
	var me = this;
	this.channels = {};
	this.clients = new wompt.ClientPool();
	this.count = 0;
	this.options = options;
	this.expirer = new wompt.Expirer(this.channels, {
		expire_after_ms: 24 * 60 * 60 * 1000, // 24 hours
		keep_if: function(channel){
			return channel.clients.count > 0;
		},
		time_attribute:'touched'
	});
	this.expirer.on('expired', function(channel){
		me.count--;
		channel.clean_up();
	});
}

var proto = {
	get: function(name, cb){
		var room = this.peek(name);
		if(room) return cb(room);
		return this.create(name, cb);
	},
	
	peek: function(name){
		return this.channels[Channel.generalizeName(name)];
	},
	
	create: function(name, callback){
		name = Channel.generalizeName(name);
		var channel = new wompt.Channel({
				name: name,
				namespace: this.options.namespace,
				ops: this.options.allowOps
			}, function(channel){
			callback(channel);
		});
		this.channels[name] = channel;
		this.count++;
		this.emit('new_channel', channel);
	},
	
	addClient: function(client){
		this.clients.add(client);
	},
	
	remove: function(channel){
		var exists = this.channels[channel.name];
		if(exists){
			delete this.channels[channel.name];
			this.count--;
		}
		return exists;
	},
	
	each: function(callback){
		var channels = this.channels;
		for(var k in channels){
			if(channels.hasOwnProperty(k)){
				if(callback(channels[k])) return;
			}
		}
	}
}

util.inherits(ChannelManager, events.EventEmitter);
for(var k in proto) ChannelManager.prototype[k] = proto[k];

module.exports = ChannelManager;
