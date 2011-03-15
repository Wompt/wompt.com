var http = require('http'),
    env = require('./environment');

var redirector = http.createServer(function(req,res){
	res.writeHead(302, {
		'Location':'http://wompt.com' + req.url
	});
	res.end();
});

if(env.redirectWww)
	redirector.listen(env.redirectWwwToPort);