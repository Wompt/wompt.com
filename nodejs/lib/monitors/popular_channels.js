var DEFAULTS = {
	 interval: 1 * 60 * 1000
	,length: 5
};

function PopularChannels(channelManager, interval){
	this.channels = channelManager;
	this.sorted_list = [];
	
	this._timer = setInterval(this.rebuildPopularList.bind(this), interval || DEFAULTS.interval);
}


PopularChannels.prototype.rebuildPopularList = function(){
	var list = [];
	var hash = {};

	while(list.length < DEFAULTS.length && list.length < this.channels.count){
		var most_clients_channel = null
		  , most_clients = 0;
				
		this.channels.each(function(channel){
			if(channel.clients.count >= most_clients && !hash.hasOwnProperty(channel.name)){
				most_clients = channel.clients.count;
				most_clients_channel = channel;
			}
		});
		
		list.push(most_clients_channel);
		hash[most_clients_channel.name] = true;
	}
	
	this.sorted_list = list;
}

module.exports = PopularChannels;
