UI.once('init', function(){
	var UI = this
	  , should_scroll = true
		, pane = $("#messages_scroller")
		, paneEl = pane.get(0)
		, scrolling = false
		, bottom_dist
		, old_height
		// When the height of the content scrolled beneath the viewport is greater than this
		// don't auto-scroll
		, SCROLL_LIMIT = 40;

	var me = UI.messagesScroller = {				
		scroll: function(animate, destScroll, newContent){ // destScroll defaults to bottom of content area
			if(destScroll == null)
				destScroll = paneEl.scrollHeight - pane.innerHeight(); // height of content - height of viewport (always <= height of content)
			
			if(animate){
				var distance = destScroll - pane.scrollTop(), // distance to scroll the viewport
				added_height = paneEl.scrollHeight - old_height, // height of new content
				end_at = {scrollTop: destScroll, bottom:0};

				if(newContent && destScroll == 0){ // the content is smaller than the viewport
					pane.css('bottom',-added_height); //we have to slide the content from slightly below the viewport, instead of scrolling it
					distance = added_height;
				}
				
				if(distance > 0){
					scrolling = true;
					pane.stop().animate(
						end_at,
						200 + Math.sqrt(distance) * 10,
						'swing',
						function(){scrolling = false;}
					);
				}
			}else{
				pane.scrollTop(destScroll);
			}
		},
		
		checkShouldSroll: function(data){
			// content height - hidden area above viewport - viewport = area scrolled below viewport
			old_height = paneEl.scrollHeight;
			bottom_dist = old_height - pane.scrollTop() - pane.innerHeight();
			should_scroll = scrolling || (bottom_dist < SCROLL_LIMIT);
		},
		
		save: function(){
			var bottom_scroll = paneEl.scrollHeight - pane.scrollTop() - pane.innerHeight();
			return {
				restore: function(){  // content height - bottom distance - viewport = TopScroll
					me.scroll(true, paneEl.scrollHeight - bottom_scroll - pane.innerHeight());
				}
			}
		}
	}
	
	UI.on('before_append', me.checkShouldSroll);
	UI.on('after_append', function(data){
		if(should_scroll){
			me.scroll(!$.isArray(data), null, true);
		}
	});
	UI.on('resize', function(){
		if(should_scroll){
			me.scroll(true, null, true);
		}
	});
});