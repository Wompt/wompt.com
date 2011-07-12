// To support using nodejs modules that do module.exports = ...
var module = {};

var Util = {
Text: (function Text(){
	var http_matcher = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	var www_matcher = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	var mail_to_matcher = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
	var my_name = (window.Me && Me.name && Me.name.toLowerCase()) || '';
	var filter = (function(){
		var f = UiOptions.wordFilter;
		return  f && new RegExp(f.join('|'));
	})();
	
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
		},
		
		wordFilter: function(text){
			if(!filter) return text;
			return text.replace(filter, function(m) {
				return Array(m.length+1).join("*");
			});
		}
	};
})(),

nextTick: function(f){
	return setTimeout(f,0);
},

ts:function(){
	return new Date().getTime();
},

time:function time(t){
	var H = t.getHours(),
			h = H % 12,
			m = t.getMinutes();
	
	return (h==0 ? 12 : h) + ":" + (m < 10 ? '0' + m : m) + (H > 11 ? 'pm' : 'am');
},

date:function date(t){
	var d = t.getDate(),
	    m = t.getMonth() + 1;
	
	return m + "/" + (d < 10 ? '0' + d : d);
},

url:function(){
	return window.location.href.split('?')[0];
},

inherits:function(to, from){
	$.extend(to.prototype, from.prototype, {_super: from});
}
};

if(window.EventEmitter){
	EventEmitter.prototype.muteEvents = function(fn){
		this.emit = function(){}
		fn();
		delete this.emit;
	}
}
