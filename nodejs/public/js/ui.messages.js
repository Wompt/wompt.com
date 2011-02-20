UI.once('init', function(){
	var UI = this
	  , messages = new MessageList()
	  , last_line = null;

	function appendMessageToElement(data, to_container){
		var text = data.msg;
		var msg = data.ui_div = $('<div>');
		prepareMessageElement(msg, text);
		to_container.append(msg);
		return msg;
	}

	function prepareMessageElement(el, text){
		if(Util.Text.linkifyTest(text)){
			//escape <,> so we don't include any nasty html tags
			text = text.replace(/</g, '&lt;').replace(/>/g,'&gt;');
			el.html(Util.Text.linkify(text));
		}
		else
			el.text(text);
		
		el.addClass('msg');
		return el;
	}
	
	function pruneOldMessages(){
		var list = messages.list,
		    num_to_remove = list.length - WOMPT.messages.max_shown;
		
		if(num_to_remove <=0) return;
		
		for(var i=0; i<num_to_remove; i++){
			// Remove the message text element
			list[i].ui_div.remove();
			
			// if the next message is it's own message group, this message is the only
			// one in its group and the whole TR should be removed.
			if(list[i+1].first_in_group)
				list[i].line.remove();
		}
		list.splice(0,num_to_remove);
		// The new first message is always the first in it's group
		list[0].first_in_group = true;
	}

	UI.Messages = {
		list:messages,
		
		append: function(data){
			if(last_line && last_line.from.id == data.from.id){
				appendMessageToElement(data, last_line.msg_container);
			}else{
				var line = $('<tr>'),
						nick = $('<td>'),
						msg_container  = $('<td>');
			
				nick.text(data.from.name);
				nick.addClass('name');
				nick.css('color', UI.Colors.forUser(data.from.id));
				
				appendMessageToElement(data, msg_container);
				
				line.append(nick, msg_container);
				line.addClass('line');
	
				data.first_in_group = true;
				data.line = line;		
				data.msg_container = msg_container;
				last_line = data;
		
				$('#message_list').append(line);
			}
			pruneOldMessages();
			UI.emit('message_appended', data);
		},
		
		system: function(msg){
			this.appendMessage({from:{name: "System", id:'system'}, msg:msg});		
		}		
	}
	
	messages.on('appended', UI.Messages.append);
});
