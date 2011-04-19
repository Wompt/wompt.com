(function(){
	var id = 'name_requestor',
	popup = $('#' + id);
	popup.find('#done').click(submit);
	popup.find('#new_name').keydown(function(e){
		if(e.which == 13){
			submit();
			e.preventDefault();
		}
	});
	function submit(){
		UI.Popup.respondWith({
			context:id,
			name:popup.find('#new_name').val()
		});
	}	
})();