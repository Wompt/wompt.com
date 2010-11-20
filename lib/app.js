var http   = require("http"),
    url    = require("url"),
    wompt  = require("./includes"),
    io     = require("socket.io"),
    logger = wompt.logger,
    mongodb = wompt.db,
    express = require("express");


function App(options){
	this.channels = {};
	this.config = options.config;
	this.pretty_print_config();
	this.clients = new wompt.ClientPool();
	this.express = this.create_express_server();
	
	this.socket_middleware = [
		express.cookieDecoder()
	];
}

App.prototype = {
	pretty_print_config: function(){
		logger.log("Wompt.com started with config: ");
		logger.dir(this.config);
	},

	create_express_server:function(){
		var config = this.config;
		var exp = express.createServer();
		var me = this;
		
		exp.configure(function(){
			exp.use(me.statusMiddleware());			
			exp.use(express.logger({format: ':method :url :status :response-time' }));
			exp.use(express.cookieDecoder());
			exp.use(express.staticProvider(config.public_dir));
		});

		exp.set('views', wompt.env.root + '/views');		
		exp.set('view engine', 'jade');
		
		exp.get("/chat/:channel", function(req, res, params){
			wompt.Auth.get_or_set_token(req, res);
			
			res.render('chat', {
				locals:{
					channel: req.params.channel
				}
			});
		});
		
		exp.get("/", function(req, res, params){
			wompt.Auth.get_or_set_token(req, res);
			var vars = me.standard_page_vars(req);
			res.render('index', {
				locals: vars
			});
		});
		
		exp.post("/", express.bodyDecoder(), function(req, res, params){
			wompt.Auth.get_or_set_token(req, res);
			res.redirect('/chat/' + req.body.channel);
		});
		
		exp.get("/users/new", function(req, res, params){
			res.render('users/new');
		});
		
		exp.post("/users/new", express.bodyDecoder(), function(req, res, params){
			b = req.body;
			wompt.User.find({$or: [{name: b.name} , {email: b.email}]}).first(function(doc){
				logger.log(doc);
				if(doc == null){
					//todo sanity check user input
					var user = new wompt.User({
						name: b.name,
						email: b.email,
						password: b.password
					});
					user.save();
					wompt.Auth.start_session(res, user);
					res.redirect('/');	
				}
				else {
					res.redirect("/users/new");
				}
			});
		});

		exp.get("/users/sign_in", function(req, res, params){
			res.render('users/sign_in');
		});

		exp.post("/users/sign_in", express.bodyDecoder(), function(req, res, params){
			wompt.Auth.sign_in_user(req.body, {success:function(user){
				wompt.Auth.start_session(res, user);
				res.redirect('/chat/room1');
			}});
		});

		exp.get("/support", function(req, res, params){
			res.render('support');
		});

		exp.get("/terms", function(req, res, params){
			res.render('terms');
		});

		exp.get("/privacy", function(req, res, params){
			res.render('privacy');
		});
		
		return exp;
	},
	
	standard_page_vars: function(req){
		var vars = {
			url: req.url,
			
		};
		return vars;
	},
	
	start_server: function(){
		this.express.listen(this.config.port, this.config.host);
		this.start_socket_io();
		
		logger.log("Starting server on port: " + this.config.port);
	},
	
	start_socket_io: function(){
		if(this.socket) return;
		var app = this;
		
		this.socket = io.listen(this.express);
		this.socket.on('connection', function(client){
			logger.log("Connection from: " + client.sessionId);
			app.apply_socket_middleware(client);

			app.clients.add(client);

			client.once('message', function(data){
				logger.log('Handing off client:' + client.sessionId + ' to Channel: ' + data.chan)
				var channel = app.get_channel(data.chan);
				if(channel){
					channel.add_client(client);
				}
			});
			
			wompt.Auth.authenticate_client(client, {
				
				authenticated:function(client, user){
					logger.log("Authenticated as user: " + user.name);
					user = user.wrap();
					client.user = user;
					user.clients.add(client);
				},
				
				anonymous:function(client){
					client.anonymous = true;
					var user = new wompt.User();
					user = user.wrap();
					client.user = user;
					user.clients.add(client);
				}
			})
		}); 		
	},
	
	apply_socket_middleware: function(client){
		var cont = true,
		    req = client.request,
		    res = client.response;
				
		for(var i=0, len=this.socket_middleware.length;i<len; i++){
			if(!cont) break;
			this.socket_middleware[i](client.request, client.response, function(){cont = true;});
		}
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
	},
	
	statusMiddleware: function(){
		return function(req, res, next){
			if(req.url == '/ok'){
				res.send("OK", 200);
				res.end();
			}else{
				next();
			}
		};
	}
}

module.exports = App;
