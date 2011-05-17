UI.once('init', function(){
	var c = $('#chat'),
	hide_userlist_at = 700,
	layout_delay = 200,
	small_at = 700,
	resizeTimer;
	
	setTimeout(onResize, 1000);
	
	$(window).resize(function(){
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(onResize, layout_delay);
	});
	
	function doLayout(){
		var w = c.width();
		c.toggleClass('small', w < small_at);
		var taller = $('body').height() >= $(window).height();
		$('.main').toggleClass('taller', taller);
	}

	function hideShowUserlist(){
		$('.hide_userlist').removeClass('hide_userlist');
		var w = c.width(),
		hide_ul = w < hide_userlist_at;
		c.toggleClass('hide_userlist', hide_ul)
		.toggleClass('show_userlist', !hide_ul)
	}
	
	function onResize(){
		doLayout();
		hideShowUserlist();
		UI.emit('resize');
	}
	
	//stick the footer at the bottom of the page if we're on an iPad/iPhone due to viewport/page bugs in mobile webkit
	if(navigator.platform == 'iPad' || navigator.platform == 'iPhone' || navigator.platform == 'iPod'){
		$("#footer_container").css("position", "static");
	};
	
	$('.userlist_toggle').click(function(e){
		c.toggleClass('hide_userlist').toggleClass('show_userlist');
		e.preventDefault();
	})
});
