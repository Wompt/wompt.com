// To support using nodejs modules that do module.exports = ...
var module = {};

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
		},
		
		filterProfanity: function(text){
			var profanity = new RegExp("ahole|anus|ash0le|ash0les|asholes|ass|Ass Monkey|Assface|assh0le|assh0lez|asshole|assholes|assholz|asswipe|azzhole|bassterds|bastard|bastards|bastardz|basterds|basterdz|Biatch|bitch|bitches|Blow Job|boffing|butthole|buttwipe|c0ck|c0cks|c0k|Carpet Muncher|cawk|cawks|Clit|cnts|cntz|cock|cockhead|cock-head|cocks|CockSucker|cock-sucker|crap|cum|cunt|cunts|cuntz|dick|dild0|dild0s|dildo|dildos|dilld0|dilld0s|dominatricks|dominatrics|dominatrix|dyke|enema|f u c k|f u c k e r|fag|fag1t|faget|fagg1t|faggit|faggot|fagit|fags|fagz|faig|faigs|fart|flipping the bird|fuck|fucker|fuckin|fucking|fucks|Fudge Packer|fuk|Fukah|Fuken|fuker|Fukin|Fukk|Fukkah|Fukken|Fukker|Fukkin|g00k|gay|gayboy|gaygirl|gays|gayz|God-damned|h00r|h0ar|h0re|hells|hoar|hoor|hoore|jackoff|jap|japs|jerk-off|jisim|jiss|jizm|jizz|knob|knobs|knobz|kunt|kunts|kuntz|Lesbian|Lezzian|Lipshits|Lipshitz|masochist|masokist|massterbait|masstrbait|masstrbate|masterbaiter|masterbate|masterbates|Motha Fucker|Motha Fuker|Motha Fukkah|Motha Fukker|Mother Fucker|Mother Fukah|Mother Fuker|Mother Fukkah|Mother Fukker|mother-fucker|Mutha Fucker|Mutha Fukah|Mutha Fuker|Mutha Fukkah|Mutha Fukker|n1gr|nastt|nigger|nigur|niiger|niigr|orafis|orgasim|orgasm|orgasum|oriface|orifice|orifiss|packi|packie|packy|paki|pakie|paky|pecker|peeenus|peeenusss|peenus|peinus|pen1s|penas|penis|penis-breath|penus|penuus|Phuc|Phuck|Phuk|Phuker|Phukker|polac|polack|polak|Poonani|pr1c|pr1ck|pr1k|pusse|pussee|pussy|puuke|puuker|queer|queers|queerz|qweers|qweerz|qweir|recktum|rectum|retard|sadist|scank|schlong|screwing|semen|sex|sexy|Sh!t|sh1t|sh1ter|sh1ts|sh1tter|sh1tz|shit|shits|shitter|Shitty|Shity|shitz|Shyt|Shyte|Shytty|Shyty|skanck|skank|skankee|skankey|skanks|Skanky|slut|sluts|Slutty|slutz|son-of-a-bitch|tit|turd|va1jina|vag1na|vagiina|vagina|vaj1na|vajina|vullva|vulva|w0p|wh00r|wh0re|whore|xrated|xxx|bitch|blowjob|clit|arschloch|fuck|shit|ass|asshole|b!tch|b17ch|b1tch|bastard|boiolas|buceta|c0ck|cawk|chink|cipa|clits|cock|cum|cunt|dildo|dirsa|ejakulate|fatass|fcuk|fuk|fux0r|hoer|hore|jism|kawk|l3itch|lesbian|masturbate|masterbat|masterbat3|motherfucker|mofo|nazi|nigga|nigger|nutsack|phuck|pimpis|pusse|pussy|scrotum|sh!t|shemale|slut|smut|teets|tits|boobs|b00bs|teez|testical|testicle|titt|w00se|jackoff|wank|whoar|whore|damn|dyke|fuck|shit|amcik|andskota|arse|assrammer|ayir|bi7ch|bitch|bollock|breasts|butt-pirate|cabron|cazzo|chraa|chuj|Cock|cunt|d4mn|daygo|dego|dick|dike|dupa|dziwka|ejackulate|Ekrem|Ekto|enculer|faen|fag|fanculo|fanny|feces|feg|Felcher|ficken|fitt|Flikker|foreskin|Fotze|fuk|futkretzn|gay|gook|guiena|h0r|h4x0r|hell|helvete|hoer|honkey|Huevon|hui|injun|jizz|kanker|kike|klootzak|kraut|knulle|kuk|kuksuger|Kurac|kurwa|kusi|kyrpa|lesbo|mamhoon|masturbat|merd|mibun|monkleigh|mouliewop|muie|mulkku|muschi|nazis|nepesaurio|nigger|orospu|paska|perse|picka|pierdol|pillu|pimmel|piss|pizda|poontsee|poop|porn|p0rn|pr0n|preteen|pula|pule|puta|puto|qahbeh|queef|rautenberg|schaffer|scheiss|schlampe|schmuck|screw|sh!t|sharmuta|sharmute|shipal|shiz|skribz|skurwysyn|sphencter|spic|spierdalaj|splooge|suka|b00b|testicle|titt|twat|vittu|wank|wetback|wichser|wop|yed|zabourah", "gi");
			return text.replace(profanity, function(m) {
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
