UI.once('init', function(){
	var previousLines
	,max_input_height = 6
	,min_input_height = 2;
	
	if(!readonly){
		var input = $('#message');
		input.keydown(function(e){
			if(IO.socket.connected && e.which == 13 && !e.shiftKey){
				var message = $.trim(input.val());
				
				if(message.length > WOMPT.messages.max_length){
					alert("Messages are limited to "+ WOMPT.messages.max_length + " characters.");
				}else	if(message.length > 0){
					IO.socket.send({chan: channel, action:'post', msg:message});
					input.val('');
				}
				
				e.preventDefault();
			}

			var newlines = input.val().match(Util.Text.newlineMatcher)
			,lines = newlines ? 1 + newlines.length + (e.which == 13 ? 1 : 0) : 1;
			/* lines = newlines + 1 + (1 extra if currently inserting a newline) */
			resizeInput(lines);
		});
	}
	
	function resizeInput(lines){
		lines = Math.max(min_input_height, Math.min(lines, max_input_height));
		if(lines != previousLines){
			/* at lines = 2 this needs to match the height of #input defined in the CSS */
			$("#input").height((1 + lines * 1.2).toString() + 'em');
			previousLines = lines;
		}
	}
});