UI.once('init', function(){
	var UI = this
	  , should_scroll = true
		, msgDiv = $("#messages_scroller")
		, scrolling = false
		, animateScroll = true
		// When the height of the content scrolled beneath the viewport is greater than this
		// don't auto-scroll
		, SCROLL_LIMIT = 30;

	var me = UI.messagesScroller = {				
		scrollToBottom: function(){
			if(animateScroll){
				var destScroll = (msgDiv.get(0).scrollHeight - msgDiv.innerHeight()),
				    distance = destScroll - msgDiv.scrollTop();
				
				scrolling = true;
				msgDiv.stop().animate(
					{scrollTop: destScroll},
					200 + Math.sqrt(distance) * 10,
					'swing',
					function(){scrolling = false;}
				);
			}else{
				msgDiv.scrollTop(msgDiv.get(0).scrollHeight);
			}
		},
		
		checkShouldSroll: function(data){
			// content - hidden area above viewport - viewport = area scrolled below viewport
			should_scroll = scrolling || (msgDiv.get(0).scrollHeight - msgDiv.scrollTop() - msgDiv.innerHeight()) < SCROLL_LIMIT;
		}
	}
	
	UI.on('before_append', me.checkShouldSroll);
	UI.on('after_append', function(data){
		if(should_scroll){
			var old = animateScroll;
			animateScroll = !$.isArray(data);
			me.scrollToBottom();
			animateScroll = old;
		}
	});
});