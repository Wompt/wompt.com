var sys       = require("sys"),
		url       = require("url"),
		qs        = require("querystring"),
		logger    = require("./logger"),
		App       = require("./app").App,
		Channel   = require("./channel").Channel,
		User      = require("./user").User,
		Session   = require("./session").Session

/*
 
	Objects:
		App
		 - has many channels

		Channel
		 - has many sessions

		User
		 - has many sessions

		Session
		 - belongs to user, channel
		 
		 
*/

var app = new App({
	config: {
		port: 8001
	}
});

app.start_server();
