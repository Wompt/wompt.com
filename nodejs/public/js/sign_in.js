function popupCenter(url, width, height, name) {
	var left = (screen.width/2)-(width/2);
	var top = (screen.height/2)-(height/2);
	return window.open(url, name, "menubar=no,toolbar=no,status=no,width="+width+",height="+height+",left="+left+",top="+top);
}

$("a.popup").click(function(e) {
	popupCenter($(this).attr("href"), $(this).attr("data-width") || 800, $(this).attr("data-height") || 600, "authPopup");
	e.stopPropagation(); return false;
});	