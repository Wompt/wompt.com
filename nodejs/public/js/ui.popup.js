UI.once('init', function(){
	UI.Popup = {
		newMessage: function(msg){
			if(msg.action == 'popup'){
				UI.lightbox.show();
			}
		}
	};
});