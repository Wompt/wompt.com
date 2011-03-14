var wompt  = require("./includes");

function ChannelManager(options){
	var me = this;
	this.channels = {};
	this.count = 0;
	this.expirer = new wompt.Expirer(this.channels, {
		expire_after_ms: 24 * 60 * 60 * 1000, // 24 hours
		keep_if: function(channel){
			return channel.clients.count > 0;
		},
		time_attribute:'touched'
	});
	this.expirer.on('expired', function(channel){
		channel.clean_up();
		me.count--;
	});
}

ChannelManager.prototype = {
	get: function(name){
		return this.peek(name) || this.create(name);
	},
	
	peek: function(name){
		return this.channels[name.toLowerCase()];
	},
	
	create: function(name){
		name = name.toLowerCase();
		var channel = new wompt.Channel({name: name});
		channel.app = this;
		this.channels[name] = channel;
		this.count++;
		return channel;
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
				callback(channels[k]);
			}
		}
	},

	toArray: function(){
		if(this._channelArray)
		var array = [];
		this.each(function(channel){
			array.push(channel);
		});
		return array;
	}
}

module.exports = ChannelManager;
