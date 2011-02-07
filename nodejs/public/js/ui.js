function UI(){
	if(!readonly){
		IO.socket.on('connect', function(){
			$('#message').attr('disabled', false).focus();
		});
	}
	
	this.appendMessages = function(data){
		var messages = data.messages;
		for(var i=0; i<messages.length; i++){
			this.appendMessage(messages[i]);
		}
	}

	this.update_connection_status = function(text){
		$('#connection_status').text(text);
	};
	
	this.appendMessage = function(data){
		var line = $('<div>'),
				timestamp = $('<div>'),
				nick = $('<div>'),
				msg  = $('<div>');
		
		nick.text(data.from.name);
		nick.addClass('name');
		
		var time = new Date();
		/*timestamp.text("(" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + ")");*/
		timestamp.append("(", 
			time.getHours() < 10 ? "0" + time.getHours() : time.getHours(), ":", 
			time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes(), ":", 
			time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds(), ")");
		timestamp.addClass('timestamp');		

		if(this.linkifyTest(data.msg)){
			//escape <,> so we don't include any nasty html tags
			data.msg = data.msg.replace(/</g, '&lt;').replace(/>/g,'&gt;');
			msg.html(this.linkify(data.msg));
		}
		else
			msg.text(data.msg);
		msg.addClass('msg');
		
		line.append(timestamp, nick, msg);
		line.addClass('line');
		if(msgcolor == 0){
			line.addClass('line0');
			msgcolor = 1;
		} else {
			line.addClass('line1');
			msgcolor = 0;
		}
		
		$('#messages').append(line);		
	}
	
	this.systemMessage = function(msg){
		this.appendMessage({from:{name: "System"}, msg:msg});		
	}
	
	this.linkify = function(inputText){
		var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		var replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
		var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		var replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
		var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
		var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
    return replacedText
	}

	this.linkifyTest = function(inputText){
		var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		if(inputText.match(replacePattern1))
			return true;
		var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		if(inputText.match(replacePattern2))
			return true;
		var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
		if(inputText.match(replacePattern3))
			return true;
    return false;
	}

}
