UI.once('init', function(){
	var UI = this
	  , messages = new MessageList()
	  , newline = Util.Text.newlineMatcher
	  , last_line = null
	  , msgs = [];

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
		var num_to_remove = msgs.length - WOMPT.messages.max_shown;
		
		if(num_to_remove <=0) return;

		for(var i=0; i < num_to_remove; i++){
			var msg = msgs[i], next = msgs[i+1];
			if(msg.from.id == next.from.id){
				next.nick.text(next.from.name);
				next.nick.css('color', UI.Colors.forUser(next.from.id));
				next.nick.addClass('name');
				next.line.addClass('first');
			}
			msg.line.remove();
		}

		msgs.splice(0,num_to_remove);
	}
	
	function firstMessageInGroup(msg){
		msg.nick.text(msg.from.name);
		msg.nick.css('color', UI.Colors.forUser(msg.from.id));
		msg.nick.addClass('name');
		msg.line.addClass('first');
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
			var same_person = last_line && (last_line.from.id == data.from.id),
				line = $('<tr>'),
				nick = $('<td>'),
				msg_container  = $('<td>');

			if(data.from.id == 'system')
				line.addClass('system');
				
			line.addClass('line');
			prepareMessageElement(msg_container, data.msg);
			line.append(nick, msg_container);

			data.line = line;
			data.nick = nick;
			last_line = data;
			
			if(!same_person) firstMessageInGroup(data);
	
			$('#message_list').append(line);
			msgs.push(data);
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
