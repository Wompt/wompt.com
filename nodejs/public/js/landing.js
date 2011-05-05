$(function(){
	UI.emit('init');

	var slides = $('.slides .slide').get(), current = 1;
	function showNext(){
		var i=0;
		$.each(slides, function(key, slide){
			var s = $(slide);
			
			s[addClassIf(-1)]('past')
			[addClassIf(0)]('current')
			[addClassIf(1)]('future');
			i++;
		});
		current = (current + 1) % i;
		console.log(current);
		function addClassIf(inc){
			var x = (current + inc) % slides.length;
			if(x < 0) x = x + slides.length;
			return (x == i ? 'add' : 'remove') + 'Class';
		}
	}
	setInterval(showNext, 5000);
});


