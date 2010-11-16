var sys       = require("sys"),
		url       = require("url"),
		qs        = require("querystring"),
		env       = require("./environment"),
		wompt     = require("./lib/includes");

/*
 
	Objects:
		App
		 - has many channels
		 - has many clients

		Channel
		 - has many clients

*/

var app = new wompt.App({
	config: env
});

app.start_server();
