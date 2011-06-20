UI.once('init',function(){

	var extras = $('#tools').click(function(e){
		if(e.target.parentNode.id != 'tools') return;
		var panel = $('.' + e.target.id + '.panel'),
		selected = panel.hasClass('selected'),
		drawer = $('#top_drawer');

		$('#tools_panels .panel').removeClass('selected');
		panel.addClass('selected');
		var closed = selected && drawer.hasClass('open');
		drawer.height(closed ? 0 : $("#tools_panels").height()+4);
		drawer.toggleClass('open', !closed);
	});
	
	var form = $('#embed_form');
	form.find('input').keyup(updateCode);
	
	function updateCode(){
		var code = [
		'<iframe src="http://wompt.com/chat/',
			encodeURIComponent(form.find('#room_name').val() || channel),
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
