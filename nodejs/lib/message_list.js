exports.MessageList = function(){
	this.messages = [];
}

exports.MessageList.prototype = {
	add: function(msg){
		this.messages.push(msg);
	},
	
	since: function(time){
		var msgs = this.messages;
		
		var i=msgs.length;
		while(msgs[--i].time > time) {};
		
		return messages.slice(i+1);
	},
	
	recent: function(count){
		var msgs = this.messages;
		count = Math.min(msgs.length, count);
		return msgs.slice(msgs.length-count);
	}
}
