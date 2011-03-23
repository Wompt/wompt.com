UI.once('init', function(){
	var UI = this
		, should_notify = false
		, notify_cycle = 1
		, interval_id = null
		, missed_messages = 0;

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
						document.title = notify_cycle == 1 ? "New Messages: " + missed_messages : "Wompt -  " + channel;
						notify_cycle *= -1;
					}else{
						document.title = "Wompt -  " + channel;
						notify_cycle = 1;
						missed_messages = 0;
						clearInterval(interval_id);
					}
				}, 1000);
			}
		}
	});
});

