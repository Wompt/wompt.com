var userList
  , Util = {};

jQuery(function(){
	IO = new IO();

	userList = new UserList();
	uli = new UserListUI(userList, $('#user_list .users'));

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
	IO.addMessageHandler(UI.Popup);

	IO.connect();
	
	document.getElementById("message").focus();
});
