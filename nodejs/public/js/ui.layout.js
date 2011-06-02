UI.once('init', function(){
	var c = $('#chat'),
	hide_userlist_at = 700,
	layout_delay = 200,
	small_at = 700,
	hul = 'hide_userlist',
	resizeTimer;
	
	setTimeout(function(){
		$('.'+hul).removeClass(hul);
		toggleUserlist(c.width() >= hide_userlist_at)
		doLayout()
	}, 1000);
	
	$(window).resize(function(){
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(onResize, layout_delay);
	});
	
	function doLayout(){
		var w = c.width();
		c.toggleClass('small', w < small_at);
	}

	function toggleUserlist(show){
		var saved = UI.messagesScroller.save();
		if(arguments.length < 1) show = c.hasClass(hul);
		c.toggleClass(hul,!show)
		.toggleClass('show_userlist',show);
		//This needs to be greater than the animation duration of the userlist slide so it happens afterward
		setTimeout(saved.restore, 500);
	}
	
	function onResize(){
		doLayout();
		UI.emit('resize');
	}
	
	//stick the footer at the bottom of the page if we're on an iPad/iPhone due to viewport/page bugs in mobile webkit
	var plat = navigator.platform;
	if(plat == 'iPad' || plat == 'iPhone' || plat == 'iPod'){
		$("#footer_container").css("position", "static");
	};
	
	$('.userlist_toggle').click(function(e){
		toggleUserlist();
		e.preventDefault();
	})
});
