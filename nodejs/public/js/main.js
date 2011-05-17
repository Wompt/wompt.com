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
	
	[
		UI.Messages.list,
		UI.Messages,
		userList
	].forEach(IO.addMessageHandler)

	IO.connect();
	
	document.getElementById("message").focus();
});
