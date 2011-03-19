var events = require("events");

function MessageList(){
	this.messages = [];
}

var proto = MessageList.prototype;

proto.add = function(msg){
	this.messages.push(msg);
	if(this.messages.length > this.MAX_MESSAGES) this._downsize();
}

proto._downsize = function(){
	var new_size = Math.ceil(this.messages.length * this.DOWNSIZE_RATIO);
	this.messages.splice(0, this.messages.length - new_size);
}

proto.since = function(time){
	var msgs = this.messages;
	
	var i=msgs.length;
	while(msgs[--i].time > time) {};
	
	return messages.slice(i+1);
}
	
proto.recent = function(count){
	var msgs = this.messages;
	count = Math.min(msgs.length, count);
	return msgs.slice(msgs.length-count);
}

proto.is_empty = function(){
	return this.messages.length == 0;
}


//Constants
proto.MAX_MESSAGES = 200
proto.DOWNSIZE_RATIO = 0.5;

exports.MessageList = MessageList;
