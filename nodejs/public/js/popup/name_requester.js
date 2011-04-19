(function(){
	var id = 'name_requestor',
	popup = $('#' + id);
	
	popup.find('#done').click(function(){
		UI.Popup.respondWith({
			context:id,
			name:popup.find('#new_name').val()
		});
	});
})();