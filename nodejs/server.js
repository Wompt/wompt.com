require('./redirector');
var wompt     = require("./lib/includes");

var app = new wompt.App({
	config: wompt.env,
	root: __dirname
});

app.start_server();
