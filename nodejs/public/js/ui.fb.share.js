UI.once('init',function(){
	UI.fb.ensureInit();
	$('#fb-share').click(function(e){
		UI.fb.ensureLoggedIn(UI.fb.shareCurrentPage);
		e.preventDefault();
	});
});

UI.fb = {
	ensureLoggedIn: function(cb){
		if(window.FB){
			var session = FB.getSession();
			if(session){
				cb();
			} else {
				FB.login(function(res){
					if(res.session)	cb();
				})
			}
		}
	},
	
	shareCurrentPage: function(){
		FB.ui({ method: 'feed',
			display: 'iframe',
			message: "I'm chatting right now on Wompt at: " + window.location.href + " - Come join me!"
		});
	},

	init: function(){
		FB.init({
			appId  :'181725458505189',
			status :true, // check login status
			cookie :true, // enable cookies to allow the server to access the session,
			channelUrl :window.location.protocol + '//' + window.location.host + '/fb_cross_domain.html',
			xfbml: true
		});
	},
	
	schedule: function(fn, count){
		return function(){
			if(count-- == 0) fn();
		}
	}
};

UI.fb.ensureInit = UI.fb.schedule(UI.fb.init, 2);

window.fbAsyncInit = UI.fb.ensureInit;
