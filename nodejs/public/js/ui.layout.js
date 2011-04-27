UI.once('init', function(){
	var c = $('body'),
	hide_userlist_at = 650,
	layout_delay = 200,
	narrow_at = 800,
	resizeTimer;
	
	doLayout();
	
	$(window).resize(function(){
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(doLayout, layout_delay);
	});
	
	function doLayout(){
		var w = $(window).width();
		c[(w < hide_userlist_at ? 'add' : 'remove') + 'Class']('hide_userlist');
		$('.container')[(w < narrow_at ? 'add' : 'remove') + 'Class']('narrow');
	}
	
	//stick the footer at the bottom of the page if we're on an iPad/iPhone due to viewport/page bugs in mobile webkit
	if(navigator.platform == 'iPad' || navigator.platform == 'iPhone' || navigator.platform == 'iPod'){
		$("#footer_container").css("position", "static");
	};
});
