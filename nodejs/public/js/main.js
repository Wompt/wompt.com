var userList;

jQuery(function(){
	IO = new IO();

	userList = new UserList();
	UI.userList = new UserListUI(userList, $('#user_list .users'), $('#user_list .top'));

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
		// TODO: renable this when we finish Ops
		// new Ops(UI.userList)
	].forEach(IO.addMessageHandler)

	IO.connect();
	
	document.getElementById("message").focus();
});
