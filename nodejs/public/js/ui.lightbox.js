UI.lightbox = (function(){
	var overlay, center, content, opts={}, me = {};
	
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
	
	/*
		options = {
			cancellable: bool
		} */
	me.show = function(options){
		setup();
		opts = options;
		content.html(options.html);
		overlay.addClass('shown');
		me.visible = true;
	}
	
	me.close = function(){
		overlay.removeClass('shown');
		me.visible = false;
	}
	
	return me;
})();
