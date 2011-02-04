var wompt  = require("./includes");

function ChannelManager(options){
	this.channels = {};
	this.count = 0;
}

ChannelManager.prototype = {
	get: function(name){
		name = name.toLowerCase();
		var channel = this.channels[name];
		if(!channel) channel = this.create(name);
		return channel;
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
	}
}

module.exports = ChannelManager;
