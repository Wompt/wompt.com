var http = require('http');

var redirector = http.createServer(function(req,res){
	res.writeHead(301, {
		'Location':'http://www.wompt.com:80' + req.url
	});
	res.end();
});

if(require('./environment').redirectPort80)
	redirector.listen(80);