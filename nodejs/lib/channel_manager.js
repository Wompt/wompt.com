var wompt  = require("./includes");

function ChannelManager(options){
	this.channels = {};
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
		return channel;
	}
}

module.exports = ChannelManager;
