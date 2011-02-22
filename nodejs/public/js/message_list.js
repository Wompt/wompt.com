function MessageList(){
	this.list = [];

	function scrollParent(){
		var msgDiv = $("#messages_scroller");
		msgDiv.scrollTop(msgDiv.get(0).scrollHeight);
	}
	
	// message handler for our IO class
	this.newMessage = function(msg){
		if(msg.action == 'message'){
			this.list.push(msg);
			this.emit('appended', msg);
			scrollParent()
			return true;
		}else if(msg.action == 'previous'){
			var me = this;
			$.each(msg.messages, function(i, m){
				me.list.push(m);
				me.emit('appended', m);	
			});
			scrollParent();
			return true;
		}
		return false;
	}
}

MessageList.prototype = new EventEmitter();
