var http   = require("http"),
    url    = require("url"),
    wompt  = require("./includes"),
    logger = wompt.logger;
		

function App(options){
	this.channels = {};
	this.sessions = {};
	this.config = options.config;
}

App.prototype = {
	start_server: function(){
		var app = this;
		this.server = this.server || http.createServer(function(){app.request_processor.apply(app, arguments);})
		this.server.listen(this.config.port, this.config.host);
		logger.log("Starting server on port: " + this.config.port);
	},
	
	request_processor: function(request, response){
		if(request.method === "GET" || request.method === "HEAD"){
			if(request.url.match(/^\/chat\//)) this.chat_request({req: request, res: response});
		}
	},
	
	chat_request: function(con){
		var parts = con.req.url.split('/', 3);
		var channel = this.get_channel(parts[2]);
		
		if(channel)
			channel.process_request(con);
	},

	get_channel: function(name){
		var channel = this.channels[name];
		if(!channel) channel = this.create_channel(name);
		return channel;
	},
	
	create_channel: function(name){
		var channel = new wompt.Channel({name: name});
		this.channels[name] = channel;
		return channel;
	}
}

exports.App = App;
