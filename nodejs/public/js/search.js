$(function(){
	var last_query,
	searching,
	timer,
	delay = 300,
	input = $('#wompt_search');
	
	if(window.initialResults){
		last_query = input.val().trim();
		showResults(last_query, window.initialResults);
	}
	
	input.keyup(function(e){
		var query = input.val().trim();
		if(last_query == query && e.which != 13) return;
		scheduleSearch();
		last_query = query;
	})

	function scheduleSearch(){
		clearTimeout(timer);
		timer = setTimeout(function(){
			if(searching) return;
			searching = true;
			var query = input.val().trim();
			$.ajax({
				url: '/rooms/search',
				dataType: 'json',
				success: function(data){
					showResults(query, data)
				},
				complete: function(){
					searching = false
				},
				data: {term: query}
			});
		}, delay)
	}
	
	function showResults(query, data){
		if(!data) return;

		// Sort results by room population
		data.sort(function(a,b){
			return (b.u || 0) - (a.u || 0)
		});

		var results = $('#results'),
		title = $('<h3>'),
		titleText = query && query.length > 0 ?
			(data.length + " Room" + (data.length == 1 ? '' : 's') + " Matching '"+ query +"'")
			:
			"Popular Rooms";
		results.empty();
		results.append(title.text(titleText))
		title.append(" - ", link('permalink', '/search' + (query ? '/?q=' + query : '')));

		data.forEach(function(room){
			var row = $('<div class="room">'),
			a = link(room.n, '/chat/' + room.n);
			row.append(a," - " + room.u);
			results.append(row);
		});
		
		if(data.length == 0){
			results
			.append(
				$('<h4>')
				.append(
					"Create a room called ",
					link(query, '/chat/' + query)
				)
			);
		}
	}
	
	function link(text, url){
		return $('<a>').attr('href', url).text(text)
	}
});