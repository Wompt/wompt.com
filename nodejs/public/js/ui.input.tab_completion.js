UI.once('init', function(){
	var completing = false,
	// JS doesn't support the /s flag that makes '.' match newlines, so '\s\S' matches ALL chars including newlines
	// This regex matches "yy@xx" and gives back ["yy@xx", "yy@", "xx"]
	completionMatcher = /^([\s\S]*@)([^\s@]+)$/, 
	start_key = 50, // @
	finish_keys = [39,9,32,13], // right arrow, tab, space, enter
	cancel_keys = [8,27,46], // backspace, escape, delete
	shouldFinish,
	info = {},
	input = $('#message'),
	input_el = input.get(0);
	
	UI.input.nameCompletion = {
		subscribeToEvents:function(){
			
			input.keydown(function(e){
				if(completing){
					if(finish_keys.indexOf(e.which) >= 0){
						shouldFinish = true;
						// only prevent the insertion of the pressed key if we found a match
						if(info.match) e.preventDefault();
					} else if(cancel_keys.indexOf(e.which) >= 0){
						cancel();
					}
				}
			});
			
			input.keyup(function(e){
				if(e.which == start_key){
					start();
				} else if(completing){
					if(shouldFinish){
						shouldFinish = false;
						// only prevent this keystroke from being handled elsewhere if we found a match
						if(info.match) e.stopImmediatePropagation();
						accept();
					}else	if(!hasSelection()){
						attempt();
					}
				}
			});
		}
	}

	function hasSelection(){
		return input_el.selectionStart != input_el.selectionEnd;
	}
	
	function start(){
		reset(true);
	}
	
	function stop(){
		reset(false);
	}
	
	function reset(going){
		completing = going;
		info.match = null;
	}
	
	function attempt(){
		var pos = input_el.selectionStart,
		str = input.val();
		
		if(pos > 0){
			var before_cursor = str.substr(0,pos),
			    completable = before_cursor.match(completionMatcher);
			
			if(completable){
				info = {
					begin:completable[1],
					middle:completable[2],
					end:str.substr(pos)
				};
				info.match = findMatchingUser(info.middle);
				completeMatchedName();
			} else
				info.match = null
		}
	}
	
	function completeMatchedName(){
		var user = info.match;
		if(user){
			var pos = input_el.selectionStart;
			var first = user.name.split(' ')[0];
			input.val(info.begin + first + info.end);
			input_el.selectionStart = pos;
			input_el.selectionEnd = info.begin.length + first.length;
			completing = true;
		} else
			stop();
	}
	
	function accept(){
		var user = info.match;
		if(user){
			var first = user.name.split(' ')[0];
			
			input.val(info.begin + first + ' ' + info.end);
			input_el.selectionStart = input_el.selectionEnd = info.begin.length + first.length + 1;
		}
		stop();
	}
	
	function cancel(){
		if(completing){
			input.val(info.begin + info.middle + info.end);
			input_el.selectionStart = input_el.selectionEnd = info.begin.length + info.middle.length;
			stop();
		}
	}	
	
	function findMatchingUser(pattern){
		pattern = pattern.toLowerCase();
		var match;

		userList.each(function(id, user){
			if(user.name.toLowerCase().indexOf(pattern) == 0){
				match = user;
				return false;
			}
		});
		return match;
	};
});