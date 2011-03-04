function MessageList(){
	this.list = [];
	
	// message handler for our IO class
	this.newMessage = function(msg){
		
		if(msg.action == 'message'){
			this.list.push(msg);
			this.emit('appended', msg);
			return true;
		}else if(msg.action == 'previous'){
			var me = this;
			$.each(msg.messages, function(i, m){
				me.list.push(m);
			});
			me.emit('batch_appended', msg.messages);
			return true;
		}
		return false;
	}
}

MessageList.prototype = new EventEmitter();
