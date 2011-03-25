UI.once('init', function(){
	var UI = this
		, should_notify = false
		, notify_cycle = true
		, interval_id = null
		, missed_messages = 0
		, standard_title = document.title
		, last_sound_time = null;
	
	var me = {
		blurred: function(){
			should_notify = true;
			if(interval_id == null){
				interval_id = setInterval(function(){
					if(should_notify && missed_messages > 0){
						document.title = notify_cycle ? missed_messages + " Unread Messages" : standard_title;
						notify_cycle = !notify_cycle;
					}
				}, 1000);
			}
		},
	
		focused: function(){
			should_notify = false;
			document.title = standard_title;
			notify_cycle = false;
			missed_messages = 0;
			if(interval_id){
				clearInterval(interval_id);
				interval_id = null;
			}
		}
	};
	
	if($.browser.msie){
		document.onfocusin = me.focused;
		document.onfocusout = me.blurred;
	}else{
		window.onfocus = me.focused;
		window.onblur = me.blurred;
	}
	


	UI.on('user_message', function(data){
		if(should_notify){
			missed_messages += $.isArray(data) ? data.length : 1;
			var now = (new Date()).getTime();
			if(!last_sound_time || now - last_sound_time >= 3000){
				last_sound_time = now;
				document.getElementById("missed_message").play();
			}
		}
	});
});

