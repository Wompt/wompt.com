function MessageList(){
	this.list = [];
	
	// message handler for our IO class
	this.newMessage = function(msg){
		if(msg.action == 'message'){
			this.list.push(msg);
		}else if(msg.action == 'batch'){
			var me = this;
			$.each(msg.messages, function(i, m){
				me.list.push(m);
			});
		}
	}
	
	this.last = function(){
		return this.list[this.list.length-1];
	}
	
	this.lastTimeStamp = function(){
		var l = this.last();
		return l && l.t;
	}
}
