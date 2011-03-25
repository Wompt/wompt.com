Util.Text = (function Text(){
	var http_matcher = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	var www_matcher = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	var mail_to_matcher = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
	
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
		}
	};
})()


soundEmbed = null;
Util.Sound = (function Sound() {
	return{
		playSound: function(sound){
			return; // temporarily disable sounds
		
			if(soundEmbed) {
				document.body.removeChild(soundEmbed);
				soundEmbed = null;
			}
			
			soundEmbed = document.createElement("embed");
			soundEmbed.setAttribute("src", "/sounds/"+sound);
			soundEmbed.setAttribute("hidden", true);
			soundEmbed.setAttribute("autostart", true);

			document.body.appendChild(soundEmbed);
		}
	};
})()
