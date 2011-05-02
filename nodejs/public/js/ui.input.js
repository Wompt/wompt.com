UI.once('init', function(){
	var previousLines
	,max_input_height = 6
	,min_input_height = 1
	,input = $('#message');
	
	function keyDown(e){
		if(!e.shiftKey && e.which == 13) e.preventDefault();
	}
	
	function keyUp(e){
		if(IO.socket.connected && e.which == 13 && !e.shiftKey && !e.stop){
			var message = $.trim(input.val());
			
			if(message.length > WOMPT.messages.max_length){
				alert("Messages are limited to "+ WOMPT.messages.max_length + " characters.");
			}else	if(message.length > 0){
				IO.socket.send({chan: channel, action:'post', msg:message});
				input.val('');
			}
		}

		var newlines = input.val().match(Util.Text.newlineMatcher)
		,lines = 1 + (newlines ? newlines.length : 0);
		resizeInput(lines);
	}
	
	function resizeInput(lines){
		if(UI.input.disableAutoExpand) return;
		lines = Math.max(min_input_height, Math.min(lines, max_input_height));
		if(lines != previousLines){
			/* at lines = 2 this needs to match the height of #input defined in the CSS */
			var em_height = 1.5 + lines * 1.2;
			$("#input").height(          lines <= 1 ? '' : em_height + 'em');
			$("#messages").css('bottom', lines <= 1 ? '' : (em_height - 3.4) + 'em');
			previousLines = lines;
		}
	}
	
	UI.input = UI.input || {};
	UI.input.subscribeToEvents = function(){
		if(!readonly){
			input.keyup(keyUp);
			input.keydown(keyDown);
		}
	};
});