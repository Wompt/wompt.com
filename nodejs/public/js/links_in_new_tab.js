$(function(){
	setTimeout(function(){
		$('a').attr('target', '_blank');
		$('a.same_window').attr('target', '_self');
	}, 1000);
});
