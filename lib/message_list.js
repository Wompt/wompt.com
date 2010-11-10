exports.MessageList = function(){
	this.messages = [];
}

exports.MessageList.prototype = {
	add_message: function(msg){
		this.messages.push(msg);
	},
	
	messages_since: function(time){
		var msgs = this.messages;
		
		var i=msgs.length;
		while(msgs[--i].time > time) {};
		
		return messages.slice(i+1, msgs.length-1);
	}
}
