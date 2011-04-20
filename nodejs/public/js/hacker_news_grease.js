var document = window.document;

function isArticleCell(el){
	return el.parentNode.tagName == 'TR';
}

function getTitle(td){
	var title = getTitleEl(td);
	return title && (title.textContent || title.innerText);
}

function getTitleEl(td){
	return td.getElementsByTagName('a')[0];
}

function addWomptLink(td, title){
	var l = document.createElement('a');

	l.appendChild(document.createTextNode('(chat)'));
	l.setAttribute('href','http://wompt.com/chat/hackernews/' + sanitizeTitle(title));
	l.setAttribute('style',"margin:0 0.5em;color:#444;");
	td.insertBefore(l, getTitleEl(td));
}

function sanitizeTitle(t){
	return encodeURIComponent(t.replace(/\s+/g, '_'));
}

var titles = document.getElementsByClassName('title');
for(var i=0,len=titles.length;i<len;i++){
	var el = titles[i];
	var title = isArticleCell(el) && getTitle(el);
	if(title){
		addWomptLink(el, title);
	}
}
