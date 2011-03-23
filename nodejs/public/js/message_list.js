function MessageList(){
	this.list = [];
	
	// message handler for our IO class
	this.newMessage = function(msg){
		
		if(msg.action == 'message'){
			this.list.push(msg);
			this.emit('appended', msg);
		}else if(msg.action == 'previous'){
			var me = this;
			$.each(msg.messages, function(i, m){
				me.list.push(m);
			});
			me.emit('batch_appended', msg.messages);
		}else
			return false;
		return true;
	}
}

MessageList.prototype = new EventEmitter();
