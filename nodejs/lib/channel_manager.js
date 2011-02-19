var wompt  = require("./includes");

function ChannelManager(options){
	var me = this;
	this.channels = {};
	this.count = 0;
	this.expirer = new wompt.Expirer(this.channels, {
		expire_after_ms: 60 * 60 * 1000, // 1 hour
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
