UI.once('init', function(){
	var tabbing = false,
	tabbableMatcher = /^(.*@)([^\s]*)$/,
	info = {};
	
	var input = $('#message'),
	input_el = input.get(0);
	
	input.keydown(function(e){
		if(e.which == 9){
			if(tabbing)
				keepTabbing();
			else
				startTabbing();
			
			e.preventDefault();
		} else{
			if(tabbing){
				finishTabbing();
			}
		}
	});

	function startTabbing(){
		var pos = input_el.selectionStart,
		str = input.val();
		
		if(pos > 0){
			var before_cursor = str.substr(0,pos),
			    tabbable = before_cursor.match(tabbableMatcher);

			if(tabbable){
				info = {
					begin:tabbable[1],
					middle:tabbable[2],
					end:str.substr(pos+1)
				}				
				info.matcher = new nameMatcher(info.middle);
				keepTabbing();
			}
		}
	}
	
	function keepTabbing(){
		var user = info.matcher.next();
		if(user){
			input.val(info.begin + user.name + info.end);
			input_el.selectionStart = info.begin.length + user.name.length;
			tabbing = true;
		}else{
			tabbing = false;
		}
	}
	
	function finishTabbing(){
		var user = info.matcher.current();
		if(user){
			var first = user.name.split(' ')[0];
			input.val(info.begin + first + info.end);
			input_el.selectionStart = info.begin.length + first.length;
		}
		tabbing = false;
	}
	
	function nameMatcher(pattern){
		var users = userList.toArray(),
		pattern = pattern.toLowerCase(),
		index=0;
		
		function findMatch(str){
			var name = str.split(' ', 1)[0];
			return (pattern == '' ? name : (str.toLowerCase().indexOf(pattern) == 0 ? name : null));
		}
		
		return {
			next: function(){
				var old_index = index;
				for(;;){
					index = (index+1) % users.length;
					
					var match = findMatch(users[index].name);
					if(match) return users[index];
					if(index == old_index) return;
				}
			},
			current:function(){
				return users[index];
			}
		};
	}
});