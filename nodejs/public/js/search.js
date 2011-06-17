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
		results.append(
			row(
				td(
					title.text(titleText)
				).attr('colspan', 2)));
		title.append(" - ");
		title.append(
			link('permalink', '/search' + (query ? '/?q=' + query : '')),
			" to this search");

		data.forEach(function(room){
			var a = link(room.n.replace('/', ' / '), '/chat/' + room.n),
			td_count = td(room.u + '', 'count');
			results.append(row(td_count, td(a)));
		});
		
		if(data.length == 0 && query != ''){
			results
			.append(row(
				$('<h4>')
				.append(
					"Create a room called ",
					link(query, '/chat/' + query)
				)
			).attr('colspan', 2));
		}
	}
	
	function row(a,b, cl){
		var row = $('<tr>');
		if(cl) row.addClass(cl);
		return row.append(a,b);
	}
	
	function td(a, cl){
		var cell = $('<td>');
		if(cl) cell.addClass(cl);
		return cell.append(a);
	}
	
	function link(text, url){
		return $('<a>').attr('href', url).text(text)
	}
});
