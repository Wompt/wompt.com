$(function(){
	UI.emit('init');
	$(".choose_name").click(function(e){
		var provider = e.target.parentNode.id.split('_')[1]; // id='provider_google'
		if(!provider) return;

		$.post('/profile',
			{useNameFrom: provider},
			function(data){
				if(data.name)
					$('#name').text(data.name);
			},
			'json'
		);
	});
})
