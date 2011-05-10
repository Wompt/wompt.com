$(function(){
	UI.emit('init');
	
	$('input#channel').autocomplete({source:'/channels/search'});

	var slides = $('.slides .slide'),
		current = 0,
		buttons = $('#slide_buttons > a').get(),
		last_slide_change,
		interval = 5000,
		timer,
		pause_left;
	
	buttons = buttons.map(function(b, i){
		var slide = $(slides.get(i));
		b = $(b);
		b.attr('href','#');
		b.click(function(e){
			stop();
			show(i);
			scheduleNext(10000);
			pause();
			e.preventDefault();
		});
		return b;
	});
	
	slides.click(stop);
	slides.bind('mouseenter', pause);
	slides.bind('mouseleave', start);
	
	buttons[0].addClass('selected');

	scheduleNext();
	
	function show(index){
		if(index == current) return;

		slides.each(function(i){
			var s = $(this),
			is_next = i == index,
			is_cur = i == current;
			
			buttons[i][addClassIf(i == index)]('selected');
			
			// add 'future' to position the coming slide off in the right place
			s[addClassIf(is_next)]('future')
			
			 // animate current slide to the default position
			 // make sure no slide is in the 'current' position
			.removeClass('current')
			
			// hide all slides except the one moving to the default position
			// -- this ensures a slide moving from default to 'current' moves
			//    invisibly from default to 'future' before being animated
			[addClassIf(!is_cur)]('hide'); 
		});
		
		// Give the UI thread some time to begin the animation and apply the CSS changes
		Util.nextTick(function(){
			var next = $(slides.get(index));
			next.removeClass('hide');
			
			Util.nextTick(function(){
				next.removeClass('future').addClass('current');
			});
		});
		
		function addClassIf(bool){
			return (bool ? 'add' : 'remove') + 'Class';
		}
		
		last_slide_change = Util.ts();
		current = index;
	}
	
	function showNext(){
		show((current + 1) % slides.length);
		scheduleNext();
	}
	
	function scheduleNext(){
		timer = setTimeout(showNext, pause_left || interval);
		pause_left = null;
	}
	
	function start(){
		if(!timer)
			scheduleNext();
	}
	
	function pause(){
		if(!pause_left){
			pause_left = Math.max(1, interval - (Util.ts() - last_slide_change));
			stop();
		}
	}
	
	function stop(){
		clearTimeout(timer);
		timer = null;
	}
});


