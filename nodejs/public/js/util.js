var Util = {
Text: (function Text(){
	var http_matcher = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	var www_matcher = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	var mail_to_matcher = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
	var my_name = (window.Me && Me.name && Me.name.toLowerCase()) || '';
	
	return {
		newlineMatcher: /\n|\r\n/gim,
		
		linkify: function(text){
			text = text.replace(http_matcher, '<a href="$1" target="_blank">$1</a>');
			text = text.replace(www_matcher, '$1<a href="http://$2" target="_blank">$2</a>');
			text = text.replace(mail_to_matcher, '<a href="mailto:$1">$1</a>');
			return text
		},
		
		linkifyTest: function(text){
			return http_matcher.test(text) ||
			       www_matcher.test(text) ||
			       mail_to_matcher.test(text);
		},
		
		mentionMatcher: function(text){
			var matches = text.match(/@([^\s]+)/g);
			return matches && matches.some(function(match){
				match = match.substr(1);
				return match.length >= 2 && my_name.indexOf(match.toLowerCase()) >= 0;
			});
		}
	};
})(),

nextTick: function(f){
	return setTimeout(f,0);
}
};

EventEmitter.prototype.muteEvents = function(fn){
	var e = this._events;
	this._events = null;

	fn();
	
	this._events = e;
}
