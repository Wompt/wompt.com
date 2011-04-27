var http   = require("http"),
    url    = require("url"),
    wompt  = require("./includes"),
    util   = require('util'),
    logger = wompt.logger,
    SocketIO= wompt.socketIO,
    assetManager = require('./asset_manager'),
    Hoptoad = require('./hoptoad'),
    express = wompt.dependencies.express;

function App(options){
	this.config = options.config;
	this.pretty_print_config();
	this.meta_users = new wompt.MetaUserManager();
	this.clients = new wompt.ClientPool();
	this.express = this.create_express_server();

	// default namespace
	this.channels =	this.chatNamespace('chat', {logged: true});

	// other namespaces
	this.chatNamespace('unlisted', {logged: true});
	
	
	this.client_connectors = new wompt.ClientConnectors();
	this.popular_channels = new wompt.monitors.PopularChannels(this.channels);

	
	this.appStateMonitor = new wompt.monitors.AppState(this, wompt.env.logs.monitor);
	this.appStateLogger = new wompt.loggers.AppStateLogger(wompt.util.mergeCopy(wompt.env.logs.monitor, {
		path: wompt.env.logs.root + '/app_state.log',
		monitor: this.appStateMonitor
	}));
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
			exp.use(express.favicon(config.public_dir + '/favicon.ico'));
			exp.use(express.static(config.public_dir, {maxAge:1000*60*60*24}));
			exp.use(express.cookieParser());
			exp.use(express.bodyParser());
			exp.use(wompt.Auth.one_time_token_middleware());
			exp.use(wompt.Auth.lookup_user_middleware());
			exp.use(wompt.Auth.meta_user_middleware(me.meta_users));
			exp.error(Hoptoad.expressErrorNotifier);
		});
		
		exp.helpers({
			assets: new wompt.Helpers.Assets(this.config.root + '/public'),
			assetHelpers: assetManager.helpers,
			cacheTimeStamps: assetManager.middleware.cacheTimestamps
		});

		exp.set('views', wompt.env.root + '/views');
		exp.set('view options',{layout: 'layouts/standard.jade'});
		exp.set('view engine', 'jade');
		exp.register('jade', wompt.dependencies.jade);
		exp.register('html', require('./templating/raw_html')({stripNewlines: true}));
		
		this.plain_routes(exp, [
			,'/support'
			,'/terms'
			,'/privacy'
		]);
		
		exp.get("/re-authenticate", function(req, res, next){
			if(req.meta_user && req.meta_user.authenticated()){
				var token = wompt.Auth.get_or_set_token(req, res);
				var connector = me.client_connectors.add({
					meta_user:req.meta_user,
					token: token
				});
				res.send({connector_id:connector.id, version_hash:wompt.env.constants.version_hash});
			}else next();
		});
		
		exp.get("/", function(req, res){
			wompt.Auth.get_or_set_token(req, res);
			res.render('index', {
				locals: me.standard_page_vars(req, {
					app:me,
					jquery: true,
					page_js: 'landing',
					page_name:'landing',
					subtitle: me.choose_subtitle()
				})
			});
		});
		
		/*
		exp.get("/users/:id", function(req, res){
			wompt.User.find({_id: req.params.id}).first(function(user){
				if(!user) return res.send("", 404);
				
				res.render('profile', {
					locals: me.standard_page_vars(req, {user:user}),
					layout: 'layouts/plain'
				});
			});
		});		
		*/
		
		exp.post("/", function(req, res){
			wompt.Auth.get_or_set_token(req, res);
			res.redirect('/chat/' + req.body.channel);
		});
		
		exp.get("/unlisted/new", function(req, res){
			var name = wompt.Auth.random_string(10);
			res.redirect('/unlisted/' + name);
		});
		
		if(wompt.env.force_sign_in){
			exp.get("/users/force_sign_in/:num", function(req, res){
				var num = parseInt(req.params.num);
				wompt.User.find().skip(num-1).first(function(user){
					if(user){
						wompt.Auth.start_session(res, user);
					}
					res.redirect('/');
				});
			});
		}

		exp.get("/user/sign_out", function(req, res){
			wompt.Auth.sign_out_user(req, res);
			res.redirect('/');
		});
		
		exp.get("/admin/stats", wompt.Auth.adminMiddleware, function(req, res){
			res.render('admin/stats', {
				locals: {w: me},
				layout: 'admin/layout'
			});
		});

		return exp;
	},
	
	standard_page_vars: function(req, custom_vars){
		var vars = {
			jquery: false,
			url: req.url,
			user: req.meta_user,
			footer: true,
			host: req.headers.host,
			config: this.config
		};
		
		if(custom_vars)
			wompt.util.merge(vars, custom_vars);

		return {
			w:vars
		};
	},
	
	choose_subtitle: function(){
		var subtitles = [
			 "Try it free, no signup required"
			,"Always free, sign in using Facebook"
			,"Speak <strong><tt>c0d3?</tt></strong> sign in using Github"
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
				var connector = app.client_connectors.get(data.connector_id);
				
				if(!connector) {
					client.send("You must pass your connector_id with the join message");
					return client._onDisconnect();
				}
				
				var namespace = connector.namespace || app.namespaces[data.namespace],
				    user      = connector.meta_user || new wompt.MetaUser();
						
				client.user = user;
				
				if(!client.uid){
					//When the user signs out, we can still know the user id while cleaning up the client
					client.uid = user.id();
					// Because this client didn't have a uid when it was first added
					app.clients.inc_user_count(client);
				}
				
				logger.log('Handing off client:' + client.sessionId + ' to Channel: ' + data.channel)
				var channel = namespace.get(data.channel);
				if(channel){
					channel.add_client(client, connector && connector.token, data);
				}
				user.clients.add(client);
			}
		});
	},

	statusMiddleware: function(){
		return function(req, res, next){
			if(req.url == '/ok'){
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end("OK");
			}else{
				next();
			}
		};
	},
	
	chatNamespace: function(namespace, options){
		this.namespaces = this.namespaces || {};
		otions = options || {};

		var me = this,
		exp = this.express,
		channelManager = new wompt.ChannelManager();
		
		this.namespaces[namespace] = channelManager;
		
		if(options.logged){
			new wompt.loggers.LoggerCreator(channelManager, namespace);
		}
		
		exp.get(new RegExp("\\/" + namespace + "\\/(.+)"), function(req, res){
			if(req.url.substr(-1,1) == '/'){
				return res.redirect(wompt.util.chop(req.url));
			}
			
			var meta_user = req.meta_user,
					channel = req.params[0];
					
			var token = wompt.Auth.get_or_set_token(req, res);

			var connector = me.client_connectors.add({
				meta_user:meta_user,
				namespace:channelManager,
				token: token
			});
			
			var locals = me.standard_page_vars(req, {
				channel: channel,
				namespace: namespace,
				connector_id: connector.id,
				url: req.url,
				jquery: true,
				page_name: 'chat',
				page_js: 'channel'
			});
			
			res.render('chat', {
				locals:locals
			});
		});
		
		return channelManager;
	},
	
	plain_routes: function(exp, urls){
		var me = this;
		urls.forEach(function(url){
			var view = url.substr(1);
			exp.get(url, function(req, res){
				res.render(view, {
						locals: me.standard_page_vars(req)
					});
			});			
		});
	},
}

module.exports = App;
