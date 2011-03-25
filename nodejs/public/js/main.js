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
});
