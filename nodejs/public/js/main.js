var userList;

jQuery(function(){
	IO = new IO();

	userList = new UserList();
	uli = new UserListUI(userList, $('#user_list .users'), $('#user_list .top'));

	UI.emit('init');
	
	[
		UI.input.nameCompletion,
		UI.input
	].
	forEach(function(watcher){
		watcher.subscribeToEvents();
	});
	
	IO.addMessageHandler(UI.Messages.list);
	IO.addMessageHandler(UI.Messages);
	IO.addMessageHandler(userList);

	IO.connect();
	
	document.getElementById("message").focus();
});
