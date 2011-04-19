UI.lightbox = (function(){
	var overlay,
	center,
	content,
	blocked,
	opts={},
	me = {};
	
	function setup(){
		if(overlay) return;
		var o = overlay = $("<div id='lb_overlay'>")
			.append(center = $("<div id='lb_center'>")
			.append(content = $("<div id='lb_content'>")));
		
		o.click(function(e){
			if(isOutsideLB(e) && opts.cancellable) me.close();
		});
		o.appendTo($('body'));
	}
	
	function isOutsideLB(e){
		return e.target.id == overlay[0].id || e.target.id == center[0].id;
	}
	
	
	function block(){
		 $('#message').attr('disabled',true);
		 blocked = true;
	}
	
	function unblock(){
		if(blocked)
			$('#message').attr('disabled',null);
		blocked = false;
	}
	
	/*
		options = {
			cancellable: false,
			blocking: true
		} */
	me.show = function(options){
		setup();
		opts = options;
		content.html(options.html);
		overlay.addClass('shown');
		if(options.blocking !== false) block();
		me.visible = true;
	}
	
	me.close = function(){
		overlay.removeClass('shown');
		unblock();
		me.visible = false;
	}
	
	return me;
})();
