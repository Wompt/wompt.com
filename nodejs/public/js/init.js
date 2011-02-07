var messageList,
    userList;
    
var msgcolor = 0;

$(document).ready(function(){
	IO = new IO();

	messageList = new MessageList();
	userList = new UserList();
	uli = new UserListUI(userList, $('#user_list .users'));

	UI = new UI();
	
	IO.addMessageHandler(messageList);
	IO.addMessageHandler(userList);

	IO.connect();
	
	if(!readonly){
		$('#message').keydown(function(e){
			if(e.keyCode == 13){
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
	$('#stats').click(function(e){
		IO.socket.send({chan: channel, action:'stats'});
	});
});
