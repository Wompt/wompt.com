UI.once('init', function(){
	var a = $('#twitter-share'),
	e = encodeURIComponent;
	a.attr('href',
		"http://twitter.com/share?"+
		"text="+e("I'm chatting right now on Wompt. Come join me!")+
		"&via=WomptChat&related="+e("abtinf:Co-Founder of Wompt")+
		"&url="+e(Util.url())
	)
})
