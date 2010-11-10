var http   = require("http"),
    url    = require("url"),
    wompt  = require("./includes"),
    io     = require("socket.io"),
    logger = wompt.logger,
    node_static = require('node-static');
		

function App(options){
	this.channels = {};
	this.config = options.config;
	this.static_server = new node_static.Server('./public');	
}

App.prototype = {
	start_server: function(){
		var app = this;
		this.server = this.server || http.createServer(function(){app.request_processor.apply(app, arguments);})
		this.server.listen(this.config.port, this.config.host);
		this.start_socket_io();
		
		logger.log("Starting server on port: " + this.config.port);
	},
	
	request_processor: function(request, response){
		if(request.method === "GET" || request.method === "HEAD"){
       this.static_server.serve(request, response);
		}
	},
	
	start_socket_io: function(){
		this.socket = io.listen(this.server);
		var me = this;
		this.socket.on('connection', function(client){
			
			client.on('message', function(data){
				var channel = me.get_channel(data.chan);
				if(channel)
					channel.receive_message(data, client);
			});
			
			client.on('disconnect', function(){
				
			}) 
		}); 		
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
