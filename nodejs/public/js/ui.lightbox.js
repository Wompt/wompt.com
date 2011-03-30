UI.lightbox = (function(){
	var overlay, center, content, opts={}, me = {};
	
	function setup(){
		if(overlay) return;
		var o = overlay = $("<div id='lb_overlay'>")
			.append($("<div id='lb_center'>")
			.append(content = $("<div id='lb_content'>")));
		o.click(function(){
			if(!opts.forceAction) me.close();
		});
		o.appendTo($('body'));
	}
	
	/*
		options = {
			forceAction: bool
		} */
	me.show = function(options){
		setup();
		opts = opts || options;
		overlay.addClass('shown');
		me.visible = true;
	}
	
	me.close = function(){
		overlay.removeClass('shown');
		me.visible = false;
	}
	
	return me;
})();
