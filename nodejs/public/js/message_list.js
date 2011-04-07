function MessageList(){
	this.list = [];
	var messages_to_keep = 1;
	
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
		this.trim();
	}
	
	this.last = function(){
		return this.list[this.list.length-1];
	}
	
	this.lastTimeStamp = function(){
		var l = this.last();
		return l && l.t;
	}
	
	this.trim = function(){
		var num_to_remove = this.list.length - messages_to_keep;
		if(num_to_remove <=0) return;
		
		this.list.splice(0,num_to_remove);
	}
}
