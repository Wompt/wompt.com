UI.once('init', function(){
	var UI = this
	  , should_scroll = true
		, msgDiv = $("#messages_scroller")
		, scrolling = false
		, animateScroll = true
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
			//height of content - height of hidden area above viewport - height of viewport
			should_scroll = scrolling || (msgDiv.get(0).scrollHeight - msgDiv.scrollTop() - msgDiv.innerHeight()) < SCROLL_LIMIT;
		}
	}
	
	UI.on('before_append', me.checkShouldSroll);
	UI.on('after_append', function(data){
		var old = animateScroll;
		animateScroll = !$.isArray(data);
		me.scrollToBottom();
		animateScroll = old;
	});
});