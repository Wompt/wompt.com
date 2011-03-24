var userList
  , Util = {};

jQuery(function(){
	IO = new IO();

	userList = new UserList();
	uli = new UserListUI(userList, $('#user_list .users'));

	UI.emit('init');
	
	IO.addMessageHandler(UI.Messages.list);
	IO.addMessageHandler(UI.Messages);
	IO.addMessageHandler(userList);

	IO.connect();
	
	if(!readonly){
		$('#message').keydown(function(e){
			if(IO.socket.connected && e.keyCode == 13){
				var el = $(this),
						message = $.trim(el.val());
				
				if(message.length > WOMPT.messages.max_length){
					alert("Messages are limited to "+ WOMPT.messages.max_length + " characters.");
				}else	if(message.length > 0){
					IO.socket.send({chan: channel, action:'post', msg:message});
					el.val('');
				}
				
				e.preventDefault();
			}
		});
	}else {
		$('#message').val('Sign in to send messages');
		$('#message').attr('disabled', 'disabled');
	}
});
