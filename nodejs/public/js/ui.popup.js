UI.once('init', function(){
	UI.Popup = {
		newMessage: function(msg){
			if(msg.action == 'popup'){
				UI.lightbox.show(msg.options);
			}
		},
		respondWith: function(msg){
			if(IO.socket){
				msg.action='popup/response';
				IO.socket.send(msg);
			}
			UI.lightbox.close();
		}
	};
});
