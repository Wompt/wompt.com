function UI(){
	var colorDispensors = {}
	this.getColorDispensor = function(context){
		if(!colorDispensors[context]){
			colorDispensors[context] = new colorDispensor();
		}
		return colorDispensors[context];
	}
	
	var last_line = null;
	
	$(document).ready(function(){
		var resize_timer;
		$(window).resize(function(){
			if(resize_timer) clearTimeout(resize_timer);
			resize_timer = setTimeout(UI.positionMessageList, 100);
		});
	});	
	
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
		if(last_line && last_line.from.id == data.from.id){
			this.appendMessageText(data.msg, last_line.msg_container)
		}else{
			var line = $('<tr>'),
			    nick = $('<td>'),
			    msg_container  = $('<td>');
		
			nick.text(data.from.name);
			nick.addClass('name');
			nick.css('color', UI.getColorDispensor('users').colorFor(data.from.id))
			
			this.appendMessageText(data.msg, msg_container)

			line.append(nick, msg_container);
			line.addClass('line');

			data.line = line;		
			data.msg_container = msg_container;
			last_line = data;
	
			$('#message_list').append(line);
		}
		
		this.positionMessageList();
	}
	
	this.systemMessage = function(msg){
		this.appendMessage({from:{name: "System"}, msg:msg});		
	}
	
	this.positionMessageList = function(){
		var message_list = $('#message_list');
		var taller = message_list.height() > message_list.parent().height();
		
		message_list.css({'position':(taller ? 'static' : 'absolute')})
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


	this.appendMessageText = function(text, to_container){
		var msg = $('<div>');
		this.prepareMessageText(msg, text);
		to_container.append(msg);
	}

	this.prepareMessageText = function(el, text){
		if(this.linkifyTest(text)){
			//escape <,> so we don't include any nasty html tags
			text = text.replace(/</g, '&lt;').replace(/>/g,'&gt;');
			el.html(this.linkify(text));
		}
		else
			el.text(text);
		
		el.addClass('msg');
		return el;
	}	
}
