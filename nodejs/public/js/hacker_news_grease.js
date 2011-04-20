// ==UserScript== 
// @name           Hacker News + Wompt Chat
// @namespace      wompt
// @include        http://news.ycombinator.com/
// @include        http://news.ycombinator.com/news
// @include        http://news.ycombinator.com/item*
// ==/UserScript==

var urlPrefix = 'http://wompt.com/chat/hackernews/';

function isArticleCell(el){
	return el.parentNode.tagName == 'TR' && getTitleEl(el);
}

function getTitle(td){
	var title = getTitleEl(td);
	return title && (title.textContent || title.innerText);
}

function getTitleEl(td){
	return td.getElementsByTagName('a')[0];
}

function addWomptLink(td){
	var l = document.createElement('a');

	l.appendChild(document.createTextNode('(chat)'));
	l.setAttribute('href',urlPrefix + getArticleId(td));
	l.setAttribute('style',"margin:0 0.5em;color:#444;");
	td.insertBefore(l, getTitleEl(td));
}

function getArticleId(el){
	var row = el.parentNode,
	subrow = row && getNext(row, 'TR'),
	links = subrow && subrow.getElementsByTagName('a');
	
	if(links && links.length > 0){
		return getArticleIdFromUrl(links[links.length-1].getAttribute('href'));
	}
}

function getArticleIdFromUrl(url){
	var id = url && url.match(/id=(\d+)$/);
	return id && id[1];	
}

function getNext(el, tag, index){
	var next = el;
	while(next){
		next = next.nextSibling;
		if(next && next.tagName == tag){
			if(!index) return next;
			index--;
		}
	}
}

function AddLinksToTitles(){
	var titles = document.getElementsByClassName('title');
	for(var i=0,len=titles.length;i<len;i++){
		var el = titles[i];
		if(isArticleCell(el)){
			addWomptLink(el);
		}
	}
}

function AddWomptFrame(){
	var outer_table = document.getElementsByTagName('table')[0],
	row =     outer_table && outer_table.getElementsByTagName('tr')[0],
	nextrow = row         && getNext(row,'TR', 1),
	table =   nextrow     && nextrow.getElementsByTagName('table')[0],
	br =      table       && getNext(table,'BR');
	if(br){
		br.parentNode.insertBefore(createWomptFrame(),br);
	}
}

function createWomptFrame(){
	var frame = document.createElement('iframe');
	frame.setAttribute('src', urlPrefix + getArticleIdFromUrl(window.location.toString()));
	frame.setAttribute('height', '600px');
	frame.setAttribute('width', '100%');
	frame.setAttribute('style', 'border:none;')
	return frame;
}

if(!window._wompt_loaded){
	window._wompt_loaded = true;
	AddWomptFrame();
	AddLinksToTitles();
}
