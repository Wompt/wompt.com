UI.once('init', function(){
	var c = $('#content'),
	hide_twitter_at = 900,
	hide_userlist_at = 600,
	layout_delay = 200,
	resizeTimer;
	
	doLayout();
	
	$(window).resize(function(){
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(doLayout, layout_delay);
	});
	
	function doLayout(){
		var w = $(window).width();
		c[(w < hide_twitter_at ? 'add' : 'remove') + 'Class']('hide_twitter');
		c[(w < hide_userlist_at ? 'add' : 'remove') + 'Class']('hide_userlist');
	}
});