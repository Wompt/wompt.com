UI.once('init', function(){
	var UI = this
	  , messages = new MessageList()
	  , newline = Util.Text.newlineMatcher
	  , last_line = null;

	function appendMessageToElement(data, to_container){
		var text = data.msg;
		var msg = data.ui_div = $('<div>');
		prepareMessageElement(msg, text);
		to_container.append(msg);
		return msg;
	}

	function prepareMessageElement(el, text){
		if(newline.test(text)){
			text
				.split(newline)
				.forEach(function(line){
					el.append(linkifyAndInsert($('<div>'), line));
				});
		}else{
			linkifyAndInsert(el,text);
		}
		
		el.addClass('msg');
		return el;
	}
	
	function linkifyAndInsert(el, text){
		if(Util.Text.linkifyTest(text)){
			//escape <,> so we don't include any nasty html tags
			text = text.replace(/</g, '&lt;').replace(/>/g,'&gt;');
			el.html(Util.Text.linkify(text));
		}
		else
			el.text(text);
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

	function join_part(text){
		return function(msg){
			var names = [];
			$.each(msg.users, function(id, u){
				names.push(u.name);
			});
			UI.Messages.system(text + names.join(','));
		}
	}
	
	UI.Messages = {
		list:messages,
		
		actions:{
			join: join_part("Joined: "),
			part: join_part("Left: "),
			
			message: function(data){
				UI.emit('before_append', data);
				UI.Messages.appendWithoutEvents(data);
				UI.emit('after_append', data);
				UI.emit('user_message', data);
			},
			
			batch: function(msg){
				UI.emit('before_append', msg.messages);
				UI.muteEvents(function(){
					$.each(msg.messages, function(i,m){
						if(m.action == 'message'){
							UI.Messages.appendWithoutEvents(m);
							UI.emit('user_message', m);
						} else
							UI.Messages.newMessage(m);
					});
				});
				UI.emit('after_append', msg.messages);
			}
		},
		
		newMessage: function(msg){
			var action = UI.Messages.actions[msg.action];
			if(action) action(msg);
		},
		
		appendWithoutEvents: function(data){
			
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
		},
		
		system: function(msg){
			UI.emit('before_append', msg);
			UI.Messages.appendWithoutEvents({from:{name: "System", id:'system'}, msg:msg});
			UI.emit('after_append', msg);
			UI.emit('system_message', msg);
		}
	}
});
