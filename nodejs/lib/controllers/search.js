var wompt = require("../includes"),
Util = wompt.util;

function SearchController(app){
	var express = app.express,
	self = this;
	
	this.register = function(){
		express.get("/rooms/search", resultsHandler);
		express.get("/search", searchPage);
	}
	
	function resultsHandler(req, res){
		var terms = req.query && req.query.term,
		limit = req.query && req.query.limit;
		
		search(terms, limit, function(results){
			res.writeHead(200, {"Content-Type":"application/json"});
			res.end(JSON.stringify(results));
		});
	}
	
	function searchPage(req, res){
		var terms = req.query && req.query.q;
		search(terms, null, function(results){
			res.render('search', {
				locals: app.standard_page_vars(req, {
					query: terms,
					resultsJSON: JSON.stringify(results),
					jquery: true,
					hide_top_query: true,
					page_js: 'search',					
					page_name:'search'
				})
			});
		});
	}
	
	function search(term, max_results, callback){
		var results = [],
		terms;
		max_results = max_results > 0 ? Math.min(max_results, 100) : 100;
		
		term = term ? term.toLowerCase() : null;
			
		if(term){
			// Limit length, split on spaces, remove blank terms, enforce maximum term count
			terms = term.substr(0,50)
				.split(' ')
				.filter(function(t){return t.length > 0;})
				.slice(0,5);

			if(terms.length > 1){
				app.channels.each(function(channel){
					var name = channel.name;
					if(terms.every(function(term){return name.indexOf(term) >= 0;}))
						results.push(channel);
					if(results.length >= max_results) return true;
				});
			} else if(term = terms[0]){
				app.channels.each(function(channel){
					if(channel.name.indexOf(term) >= 0)
						results.push(channel);
					if(results.length >= max_results) return true;
				});
			}
		} else {
			results = app.popular_channels.sorted_list;
		}
		
		callback(results.map(function(channel){
			return {n:channel.name, u:channel.clients.count}
		}));
	}	
}

module.exports = SearchController;
