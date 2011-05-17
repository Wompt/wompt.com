UI.once('init', function(){
	var completing = false,
	// JS doesn't support the /s flag that makes '.' match newlines, so '\s\S' matches ALL chars including newlines
	// This regex matches "yy@xx" and gives back ["yy@xx", "yy@", "xx"]
	completionMatcher = /^([\s\S]*@)([^\s@]+)$/, 
	start_key = 50, // @
	finish_keys = [39,9,32,13], // right arrow, tab, space, enter
	cancel_keys = [8,27,46,37], // backspace, escape, delete, left-arrow
	shouldFinish,
	info = {},
	input = $('#message'),
	input_el = input.get(0);
	
	UI.input.nameCompletion = {
		subscribeToEvents:function(){
			
			input.keydown(function(e){
				if(shouldStart(e)){
					start();
				} else if(completing){
					if(finish_keys.indexOf(e.which) >= 0){
						shouldFinish = true;
						// only prevent the insertion of the pressed key if we found a match
						if(info.match) e.preventDefault();
					/* this represents all cursor movement actions (ctrl-a, home, end, ...) */
					} else if(onlyCursorMoved()){ 
						accept(true);
					} else if(cancel_keys.indexOf(e.which) >= 0){
						cancel();
					}
				}
			});
			
			input.keyup(function(e){
				if(shouldStart(e)){
					start();
				} else if(completing){
					if(shouldFinish){
						shouldFinish = false;
						// only prevent this keystroke from being handled elsewhere if we found a match
						if(info.match) e.stopImmediatePropagation();
						accept();
					}else if(onlyCursorMoved()){
						accept(true);
					}else if(!hasSelection()){
						attempt();
					}
				}
			});
			
			input.mousedown(function(){
				if(completing) accept();
			})
		}
	}
	
	/* Check if the only thing that's changed in the cursor position */
	function onlyCursorMoved(){
		return info &&
			info.new_text == input.val() &&
			(info.start_p != start_p() ||
			info.end_p != end_p())
	}
	
	function shouldStart(e){
		return e.which == start_key && e.shiftKey;
	}

	function hasSelection(){
		return start_p() != end_p();
	}
	
	function start(){
		reset(true);
	}
	
	function stop(){
		reset(false);
	}
	
	function start_p(v){
		if(v>=0) return input_el.selectionStart = v;
		else return input_el.selectionStart;
	}
	
	function end_p(v){
		if(v>=0) return input_el.selectionEnd = v;
		else return input_el.selectionEnd;
	}
	
	function reset(going){
		completing = going;
		info.match = null;
	}
	
	function attempt(){
		var pos = start_p(),
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
			var pos = start_p();
			var first = user.name.split(' ')[0];
			info.new_text = info.begin + first + info.end;
			input.val(info.new_text);
			info.start_p = start_p(pos);
			info.end_p = end_p(info.begin.length + first.length);
			completing = true;
		} else
			stop();
	}
	
	function accept(skip_replace){
		var user = info.match;
		if(!skip_replace && user){
			var first = user.name.split(' ')[0];
			
			input.val(info.begin + first + ' ' + info.end);
			start_p(end_p(info.begin.length + first.length + 1));
		}
		stop();
	}
	
	function cancel(){
		if(completing){
			if(info.match){ // Only replace text and change selection if there was an actual match
				input.val(info.begin + info.middle + info.end);
				start_p(end_p(info.begin.length + info.middle.length));
			}
			stop();
		}
	}	
	
	function findMatchingUser(pattern){
		pattern = pattern.toLowerCase();
		var match;

		userList.each(function(id, user){
			if(user.name && user.name.toLowerCase().indexOf(pattern) == 0){
				match = user;
				return false;
			}
		});
		return match;
	};
});