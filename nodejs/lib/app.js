var http   = require("http"),
    url    = require("url"),
    wompt  = require("./includes"),
    logger = wompt.logger,
    SocketIO= wompt.socketIO,
    assetManager = require('./asset_manager'),
    express = require("express");

function App(options){
	this.meta_users = new wompt.MetaUserManager();
	this.channels = new wompt.ChannelManager();
	this.config = options.config;
	this.pretty_print_config();
	this.clients = new wompt.ClientPool();
	this.express = this.create_express_server();
	this.client_connectors = new wompt.ClientConnectors();
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
			exp.use(wompt.Auth.forward_to_auth_app_middleware());
			exp.use(express.logger({format: ':method :url :status :response-time' }));
			exp.use(assetManager.middleware);
			exp.use(express.staticProvider({root:config.public_dir, cache: config.perform_caching}));
			exp.use('/js', wompt.middleware.staticProvider({
				root:config.root + '/vendor/Socket.IO/',
				match: /^\/socket\.io\.js$/,
				cache: config.perform_caching
			}));
			exp.use(express.cookieDecoder());
			exp.use(express.bodyDecoder());
			exp.use(wompt.Auth.one_time_token_middleware());
			exp.use(wompt.Auth.lookup_user_middleware());
			exp.use(wompt.Auth.meta_user_middleware(me.meta_users));
		});
		
		exp.helpers({
			assets: new wompt.Helpers.Assets(this.config.root + '/public'),
			cacheTimeStamps: assetManager.middleware.cacheTimestamps
		});

		exp.set('views', wompt.env.root + '/views');		
		exp.set('view engine', 'jade');
		
		this.plain_routes(exp, [
			,'/support'
			,'/terms'
			,'/privacy'
		]);
		
		exp.get(/\/chat\/(.+)/, function(req, res, params){
			var meta_user = req.meta_user,
					channel = req.params[0];
					
			var token = wompt.Auth.get_or_set_token(req, res);

			var connector = me.client_connectors.add({
				meta_user:meta_user,
				token: token
			});
			
			var locals = me.standard_page_vars(req, {
				channel: channel,
				connector_id: connector.id,
				url: req.url,
				page_js: 'channel'
			});
			
			res.render('chat', {
				locals:locals
			});
		});
		
		exp.get("/", function(req, res, params){
			wompt.Auth.get_or_set_token(req, res);
			res.render('index', {
				locals: me.standard_page_vars(req, {
					subtitle: me.choose_subtitle(),
					page_js: 'landing'
				})
			});
		});

		exp.post("/", function(req, res, params){
			wompt.Auth.get_or_set_token(req, res);
			res.redirect('/chat/' + req.body.channel);
		});
		
		if(wompt.env.force_sign_in){
			exp.get("/users/force_sign_in/:num", function(req, res, params){
				var num = parseInt(req.params.num);
				wompt.User.find().skip(num-1).first(function(user){
					if(user){
						wompt.Auth.start_session(res, user);
					}
					res.redirect('/');
				});
			});
		}

		exp.get("/users/sign_out", function(req, res, params){
			wompt.Auth.sign_out_user(req, res);
			res.redirect('/');
		});

		return exp;
	},
	
	standard_page_vars: function(req, custom_vars){
		var vars = {
			url: req.url,
			user: req.meta_user,
			footer: true,
			host: req.headers.host.split(':')[0],
			config: this.config
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
	
	choose_subtitle: function(){
		var subtitles = [
			 "Try it free, no signup required"
			,"Always free, sign in using Facebook"
		];
		return subtitles[Math.floor(Math.random() * subtitles.length)];
	},
	
	start_server: function(){
		this.express.listen(this.config.port, this.config.host);
		this.start_socket_io();
		
		logger.log("Starting server on port: " + this.config.port);
	},
	
	start_socket_io: function(){
		if(this.socket) return;
		var app = this;
		
		this.socket = SocketIO.listen(this.express);
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
				var connector = app.client_connectors.get(data.connector_id),
				    user      = (connector && connector.meta_user) || new wompt.MetaUser();
				client.user = user;
				
				logger.log('Handing off client:' + client.sessionId + ' to Channel: ' + data.channel)
				var channel = app.channels.get(data.channel);
				if(channel){
					channel.add_client(client, connector && connector.token);
				}
				user.clients.add(client);
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
