UI.once('init', function(){
	var c = $('body'),
	hide_userlist_at = 650,
	layout_delay = 200,
	resizeTimer;
	
	doLayout();
	
	$(window).resize(function(){
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(doLayout, layout_delay);
	});
	
	function doLayout(){
		var w = $(window).width();
		c[(w < hide_userlist_at ? 'add' : 'remove') + 'Class']('hide_userlist');
	}
});