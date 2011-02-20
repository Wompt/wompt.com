function MessageList(){
	this.list = [];
}

MessageList.prototype.newMessage = function(msg){
	if(msg.action == 'message'){
		this.list.push(msg);
		UI.Messages.append(msg);
		var msgDiv = document.getElementById("messages");
		msgDiv.scrollTop = msgDiv.scrollHeight;
		return true;
	}else if(msg.action == 'previous'){
		var list = this.list;
		$.each(msg.messages, function(i, m){
			list.push(m);
			UI.Messages.append(m);		
		});
		var msgDiv = document.getElementById("messages");
		msgDiv.scrollTop = msgDiv.scrollHeight;
		return true;
	}
}
