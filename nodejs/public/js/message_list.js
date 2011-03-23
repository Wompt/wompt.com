function MessageList(){
	this.list = [];
	
	// message handler for our IO class
	this.newMessage = function(msg){
		
		if(msg.action == 'message'){
			this.list.push(msg);
			this.emit('appended', msg);
		}else if(msg.action == 'batch'){
			var me = this;
			$.each(msg.messages, function(i, m){
				me.list.push(m);
			});
			me.emit('batch_appended', msg.messages);
		}else
			return false;
		return true;
	}
	
	this.last = function(){
		return this.list[this.list.length-1];
	}
	
	this.lastTimeStamp = function(){
		var l = this.last();
		return l && l.t;
	}
}

MessageList.prototype = new EventEmitter();
