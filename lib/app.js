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
	this.clients = new wompt.ClientPool();
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
			var token = wompt.Auth.get_or_set_token(request, response);
			this.static_server.serve(request, response);
		}
	},
	
	start_socket_io: function(){
		if(this.socket) return;
		var app = this;
		
		this.socket = io.listen(this.server);
		this.socket.on('connection', function(client){
			app.clients.add(client);
			
			wompt.Auth.authenticate_client(client, {
				
				success:function(client, user){

					client.user = user;
					user.clients.add(client);
					
					// after this, further messages will be handled by the channel
					client.once('message', function(data){
						logger.log('Handing off client:' + client.sessionId + ' to Channel: ' + data.chan)
						var channel = app.get_channel(data.chan);
						if(channel){
							channel.add_client(client);
						}
					});
				},
				
				failure:function(user, reason){
					
				}
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
		channel.app = this;
		this.channels[name] = channel;
		return channel;
	}
}

exports.App = App;
