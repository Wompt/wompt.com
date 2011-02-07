function MessageList(){
	this.list = [];
}

MessageList.prototype.newMessage = function(msg){
	if(msg.action == 'message'){
		UI.appendMessage(msg);
		var msgDiv = document.getElementById("messages");
		msgDiv.scrollTop = msgDiv.scrollHeight;
		return true;
	}else if(msg.action == 'previous'){
		UI.appendMessages(msg);
		var msgDiv = document.getElementById("messages");
		msgDiv.scrollTop = msgDiv.scrollHeight;
		return true;
	}
}
