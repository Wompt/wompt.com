UI.once('init',function(){
	$('body').append("<div id='fb-root'></div>");
	$('#fb-share').click(function(e){
		if(window.FB){
			FB.init({ 
				 appId:'181725458505189', cookie:true, 
				 status:true, xfbml:true 
			});
		
			FB.ui({ method: 'feed',
				display: 'iframe',
				message: "I'm chatting right now on Wompt at: " + window.location.href + " - Come join me!"
			});
		}
		e.preventDefault();
	});
});
