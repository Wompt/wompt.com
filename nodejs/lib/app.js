var http   = require("http"),
    url    = require("url"),
    wompt  = require("./includes"),
    io     = require("socket.io"),
    logger = wompt.logger,
    mongodb = wompt.db,
    express = require("express");


function App(options){
	this.channels = new wompt.ChannelManager();
	this.config = options.config;
	this.pretty_print_config();
	this.clients = new wompt.ClientPool();
	this.express = this.create_express_server();
	this.user_sessions = new wompt.UserSessions();
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
			exp.use(express.staticProvider(config.public_dir));
			exp.use(express.cookieDecoder());
			exp.use(express.bodyDecoder());
			exp.use(wompt.Auth.one_time_token_middleware());
			exp.use(wompt.Auth.lookup_user_middleware());
		});
		
		exp.helpers({
			assets: new wompt.Helpers.Assets(this.config.root + '/public')
		});

		exp.set('views', wompt.env.root + '/views');		
		exp.set('view engine', 'jade');
		
		this.plain_routes(exp, [
			 '/users/new'
			,'/users/sign_in'
			,'/support'
			,'/terms'
			,'/privacy'
		]);
		
		exp.get("/chat/:channel", function(req, res, params){
			var session_id = wompt.Auth.generate_token(),
			    user = req.user || new wompt.User();
					
			wompt.Auth.get_or_set_token(req, res);

			me.user_sessions.add({id:session_id, user:user.wrap(), t: new Date()});
			var locals = me.standard_page_vars(req, {
				channel: req.params.channel,
				session_id: session_id,
				url: req.url
			});
			
			res.render('chat', {
				locals:locals
			});
		});
		
		exp.get("/", function(req, res, params){
			wompt.Auth.get_or_set_token(req, res);
			res.render('index', {
				locals: me.standard_page_vars(req)
			});
		});

		
		exp.post("/", function(req, res, params){
			wompt.Auth.get_or_set_token(req, res);
			res.redirect('/chat/' + req.body.channel);
		});
		
		
		exp.post("/users/new", function(req, res, params){
			b = req.body;
			wompt.User.find({$or: [{name: b.name} , {email: b.email}]}).first(function(doc){
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


		exp.post("/users/sign_in", function(req, res, params){
			wompt.Auth.sign_in_user(req.body, {success:function(user){
				wompt.Auth.start_session(res, user);
				res.redirect('/chat/room1');
			}});
		});

		exp.get("/users/sign_out", function(req, res, params){
			wompt.Auth.sign_out_user(req, res);
			res.redirect('/');
		});

		return exp;
	},
	
	standard_page_vars: function(req, custom_vars){
		var vars = {
			url: req.url,
			user: req.user,
			footer: true,
			host: req.headers.host.split(':')[0]
		};
		
		if(custom_vars){
			for(var k in custom_vars){
				vars[k] = custom_vars[k];
			}
		}
		return {
			w:vars
		};
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
			app.new_connection(client);
		}); 		
	},
	
	new_connection: function(client){
		logger.log("Connection from: " + client.sessionId);
		var app = this;
		
		this.clients.add(client);

		client.once('message', function(data){
			if(data && data.action == 'join'){
				var session = app.user_sessions.get(data.session_id);
				client.user = session.user;
				client.anonymous = session.user.isNew;
				session.user.clients.add(client);
				
				logger.log('Handing off client:' + client.sessionId + ' to Channel: ' + data.channel)
				var channel = app.channels.get(data.channel);
				if(channel){
					channel.add_client(client);
				}
			}
		});
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
	},
	
	plain_routes: function(exp, urls){
		var me = this;
		urls.forEach(function(url){
			var view = url.substr(1);
			exp.get(url, function(req, res, params){
				res.render(view, {
						locals: me.standard_page_vars(req)
					});
			});			
		});
	},
}

module.exports = App;
