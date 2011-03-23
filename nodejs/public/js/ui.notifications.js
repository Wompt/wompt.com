UI.once('init', function(){
	var UI = this
		, should_notify = false
		, notify_cycle = true
		, interval_id = null
		, missed_messages = 0
		, standard_title = document.title;

	if(/*@cc_on!@*/false){ // check for Internet Explorer
		document.onfocusin = function() {should_notify = false;};
		document.onfocusout = function() {should_notify = true;};
	}else{
		window.onfocus = function() {should_notify = false;};
		window.onblur = function() {should_notify = true;};
	}

	UI.on('after_append', function(data){
		if(should_notify){
			missed_messages += $.isArray(data) ? data.length : 1;
			if(!interval_id){
				interval_id = setInterval(function(){
					if(should_notify){
						document.title = notify_cycle ? missed_messages + " Unread Messages" : standard_title;
						notify_cycle = !notify_cycle;
					}else{
						document.title = standard_title;
						notify_cycle = false;
						missed_messages = 0;
						clearInterval(interval_id);
					}
				}, 1000);
			}
		}
	});
});

