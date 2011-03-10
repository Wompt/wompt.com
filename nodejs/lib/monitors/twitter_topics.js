var http = require('http')
   ,INTERVAL = 10 * 60 * 1000
	 ,SORT_INTERVAL = 1 * 60 * 1000;

var requestOptions = {
  host: 'api.twitter.com',
  port: 80,
  path: '/1/trends.json',
	headers: {
		'User-Agent': "wompt.com"
	}
};

function TwitterTopics(channels){
	this.topics = [];
	this.list = [];
	this.channelManager = channels;

	this._twitter_timer = setInterval(this.updateTopicList.bind(this), INTERVAL);
	this._sort_timer = setInterval(this._sortList.bind(this), SORT_INTERVAL);

	this.updateTopicList();
}

TwitterTopics.prototype.updateTopicList = function(){
	var me = this;
	var req =	http.get(requestOptions, function(res) {
		res.setEncoding('utf8');
		
		if(res.statusCode == 200){
			var body=[];
			res.on('data', function(data){
				body.push(data);
			}).on('end', function(){
				me._processBody(body.join());
			});
		}
		
	});
}

TwitterTopics.prototype._processBody = function(body){
	try{
		this.lastResult = JSON.parse(body);
	}catch(e){
		console.log('Error parsing JSON response from Twitter:');
		console.dir(e);
		return;
	}
	
	var trends = this.lastResult.trends;
	if(trends){
		this.list = trends.map(function(trend){
			return trend.name;
		});

		this._sortList();
		this.lastUpdatedAt = new Date();
	}
}

TwitterTopics.prototype._sortList = function(){
	var me = this;
	if(!this.list) return;
	this.sortedList = this.list.map(function(trend){
		var channel = me.channelManager.peek(trend.replace('#',''));
		return {
			 name: trend
			,channel: channel
			,clients: channel ? channel.clients.userCount : 0
		};
	}).sort(function(a,b){
		return b.clients - a.clients;
	});
}


module.exports = TwitterTopics;
