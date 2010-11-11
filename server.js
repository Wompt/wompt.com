var sys       = require("sys"),
		url       = require("url"),
		qs        = require("querystring"),
		wompt     = require("./lib/includes");

/*
 
	Objects:
		App
		 - has many channels

		Channel
		 - has many sessions

		User
		 - has many sessions

*/

var app = new wompt.App({
	config: {
		port: 8001
	}
});

app.start_server();
