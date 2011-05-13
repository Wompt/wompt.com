var events = require("events");

function MessageList(channel){
	this.messages = [];
	var self = this;
	if(channel){
		channel.on('msg', function(msg){
			if(keep_message(msg))
				self.add(msg);
		});
	}
}

function keep_message(msg){
	// Don't keep these messages around in memory.
	return msg.action != 'join' && msg.action != 'part';
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
	if(!time) return this.messages;
	var msgs = this.messages;
	
	var i=msgs.length;
	while(i && msgs[--i].t > time) {};
	
	return msgs.slice(i+1);
}
	
proto.recent = function(count){
	var msgs = this.messages;
	count = Math.min(msgs.length, count);
	return msgs.slice(msgs.length-count);
}

proto.is_empty = function(){
	return this.messages.length == 0;
}

proto.prepend = function(msgs){
	msgs = msgs.filter(keep_message);
	this.messages = msgs.concat(this.messages);
}


//Constants
proto.MAX_MESSAGES = 200
proto.DOWNSIZE_RATIO = 0.9;

exports.MessageList = MessageList;
