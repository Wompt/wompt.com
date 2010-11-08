var http   = require("http"),
    url    = require("url"),
    wompt  = require("./includes"),
    logger = wompt.logger,
    node_static = require('node-static');
		

function App(options){
	this.channels = {};
	this.sessions = {};
	this.config = options.config;
	this.static_server = new node_static.Server('./public');	
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
			if(request.url.match(/^\/chat\//))
				this.chat_request({req: request, res: response});
			else
        this.static_server.serve(request, response);
		}
	},
	
	chat_request: function(con){
		con.req.parts = con.req.url.split('/');
		var channel = this.get_channel(con.req.parts[2]);
		
		con.res.json = this.simple_json;
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
	},
	
	simple_json: function (code, obj) {
		var body = JSON.stringify(obj);
		this.writeHead(code, {
			"Content-Type": "text/json",
		  "Content-Length": body.length
		});
		this.end(body);
	}
}

exports.App = App;
