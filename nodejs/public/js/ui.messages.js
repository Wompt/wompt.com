UI.once('init', function(){
	var UI = this
	  , messages = new MessageList()
	  , newline = Util.Text.newlineMatcher
	  , last_line = null
	  , msgs = [];
	
	// Clicking on username appends @username to the input
	$('#message_list').click(function(e){
		var name = $(e.target).data('data-uname');
		if(name){
			var input = $('#message'),
			val = input.val().trim();
			val += ' @' + name.split(' ')[0];
			val = val.trim() + ' ';
			input.val(val).focus();
			input.get(0).selectionStart =
			input.get(0).selectionEnd = val.length;
		}
	})

	function prepareMessageElement(el, data){
		var text = data.msg, first;
		text
			.split(newline)
			.forEach(function(line){
				var wrap = $('<div class="wrap">');
				first = first || wrap; 
				el.append(linkifyAndInsert(wrap, line));
			});
		
		el.addClass('msg');
		
		first.append(timestamp(data));
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
	
	function timestamp(data){
		if(!data.t) return;
		
		var ts = $('<div>'),
		    time = Util.time(new Date(data.t));
		
		ts.addClass('ts');
		ts.text(time);
		return ts;
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
		if(msg.from.id != 'system'){
			msg.nick.css('color', UI.Colors.forUser(msg.from.id));
			msg.nick.data('data-uname', msg.from.name);
		}
		msg.nick.addClass('name');
		msg.line.addClass('first');
	}

	UI.Messages = {
		list:messages,
		
		actions:{
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

			if(data.from.id == 'system'){
				line.addClass('system');
				msg_container.attr('colspan', 2);
				line.append(msg_container);
			}else
				line.append(nick, msg_container);
				
			line.addClass('line');
			prepareMessageElement(msg_container, data);

			if(Util.Text.mentionMatcher(data.msg)){
				line.addClass('mention');
			}

			data.line = line;
			data.nick = nick;
			last_line = data;
			
			if(!same_person) firstMessageInGroup(data);
	
			$('#message_list').append(line);
			msgs.push(data);
			pruneOldMessages();
			return line;
		},
		
		system: function(msg){
			UI.emit('before_append', msg);
			var line = UI.Messages.appendWithoutEvents({from:{id:'system'}, msg:msg, t:Util.ts()});
			UI.emit('after_append', msg);
			UI.emit('system_message', msg);
			return line;
		}
	}
});
