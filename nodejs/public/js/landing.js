UI.once('init',function(){
	
	// This stuff is only useful if we have jquery autocomplete
	if(!($.ui && $.ui.autocomplete)) return;
	
	// Cant use the default AJAX url source option with the autocompletor because
	// we need to translate {n:"room", u:12} -> {label:"room - 2", value:"room"}
	$('input.query,input#channel').autocomplete({
		minLength: 0,
		source: performSearch,
		position:{my:'right top', at:'right bottom'},
		
		select: function(event, ui) {
			window.open(ui.item.url, '_blank');
			event.preventDefault();
		}
	});
	
	function performSearch(req,res){
		req.term = req.term.trim();
		req.limit = 15;
		var done;
		$.ajax({
			url: '/rooms/search',
			dataType: 'json',
			success: function(data){
				data = data.map(function(room){
					var name = room.n;
					if(name.length > 25) name = name.substr(0,23) + '...';
					return {
						label: room.u + " • " + name,
						value: room.n,
						url: '/chat/' + room.n}
				});
				data.push({label: "search for: " +req.term, url:'/search?q=' + req.term, 'class':"search"})
				res(data);
				done = true
			},
			complete: function(){
				if(!done) res();
			},
			data: req
		});
	}
	
	$("form#query").submit(function(e){
		var room_name = $('input.query').val().trim();
		window.open(room_name == '' ? '/search' : '/chat/' + room_name, '_blank');
		e.preventDefault();
	})
	
	// Override default rendering	for auto-complete list
	$.extend( $.ui.autocomplete.prototype, {
		_renderMenu: function( ul, items ) {
			var self = this;
			ul.append($("<h4></h4>").text("Rooms"));
			$.each( items, function( index, item ) {
				self._renderItem( ul, item );
			});
		},
		
		_renderItem:	function( ul, item) {
			return $( "<li></li>" )
				.data( "item.autocomplete", item )
				.append( $( "<a></a>" ).text( item.label ).addClass(item['class']) )
				.appendTo( ul ).attr('title', item.value);
		}
	});

	// Ugly hack to prevent the rest of this code from running on anything but the landing page
	
	if(!$('#landing').get(0)) return;
	
	UI.once('after_append', function(){
		UI.Messages.system('Weclome! You are chatting in the wompt room "general"');
	});

	var slides = $('.slides .slide'),
		current = 0,
		buttons = $('#slide_buttons > a').get();

	buttons = buttons.map(function(b, i){
		var slide = $(slides.get(i));
		b = $(b);
		b.attr('href','#');
		b.click(function(e){
			show(i);
			e.preventDefault();
		});
		return b;
	});
	
	buttons[0].addClass('selected');

	function show(index){
		if(index == current) return;

		slides.each(function(i){
			var s = $(this),
			is_next = i == index,
			is_cur = i == current;
			
			buttons[i].toggleClass('selected', i == index);
			
			// add 'future' to position the coming slide off in the right place
			s.toggleClass('future', is_next)
			
			 // animate current slide to the default position
			 // make sure no slide is in the 'current' position
			.removeClass('current')
			
			// hide all slides except the one moving to the default position
			// -- this ensures a slide moving from default to 'current' moves
			//    invisibly from default to 'future' before being animated
			.toggleClass('hide', !is_cur); 
		});
		
		// Give the UI thread some time to begin the animation and apply the CSS changes
		Util.nextTick(function(){
			var next = $(slides.get(index));
			next.removeClass('hide');
			
			Util.nextTick(function(){
				next.removeClass('future').addClass('current');
			});
		});
		
		current = index;
	}
});


