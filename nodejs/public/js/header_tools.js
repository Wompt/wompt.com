UI.once('init',function(){

	var drawer_open;
	$('#tools').click(function(e){
		// only register clicks on the children of #tools
		if(e.target.parentNode.id != 'tools') return;
		
		var panel = $('.' + e.target.id + '.panel'),
		selected = panel.hasClass('selected');

		$('#tools_panels .panel').removeClass('selected');
		panel.addClass('selected');
		drawer_open = !(selected && drawer_open);
		$('#top_drawer').height(drawer_open ? $("#tools_panels").height()+4 : 0);
		e.preventDefault();
	});
	
	var form = $('#embed_form');
	form.find('input').keyup(updateCode);
	
	function updateCode(){
		var code = [
		'<iframe src="',
			window.baseUrl || 'http://wompt.com/chat/',
			encodeURIComponent(form.find('#room_name').val() || window.channel || ''),
		'?iframe=1#c=',
			form.find('#color').val(),
		'" style="width:',
			form.find('#width').val(),
		,"; height:",
			form.find('#height').val(),
		,';" allowtransparency="true"></iframe>'
		,'<a href="http://wompt.com">Chat Powered by Wompt</a>'];
		$('#code').text(code.join(''));
	}
	updateCode();

});
