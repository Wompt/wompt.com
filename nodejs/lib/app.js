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
	var self = this;
	
	this.config = options.config;
	this.pretty_print_config();
	this.meta_users = new wompt.MetaUserManager();
	this.accountManager = new wompt.AccountManager();
	this.clients = new wompt.ClientPool();
	this.express = this.create_express_server();
	this.namespacesController = new wompt.controllers.Namespace(this);

	// default namespace
	this.channels =	this.namespacesController.createPublicNamespace('chat', {
		logged: true,
		allowIframe: true,
		allowAnonymous: true
	}).manager;

	// other namespaces
	this.namespacesController.createPublicNamespace('unlisted', {
		logged: true,
		allowAnonymous: false,
		allowOps: true
	});

	this.namespacesController.createPublicNamespace('mod', {
		logged: true,
		allowAnonymous: true,
		allowOps: true
	});
	
	this.client_connectors = new wompt.ClientConnectors();
	this.popular_channels = new wompt.monitors.PopularChannels(this.channels);

	
	this.appStateMonitor = new wompt.monitors.AppState(this, wompt.env.logs.monitor);
	this.appStateLogger = new wompt.loggers.AppStateLogger(wompt.util.mergeCopy(wompt.env.logs.monitor, {
		path: wompt.env.logs.root + '/app_state.log',
		monitor: this.appStateMonitor
	}));
	
	this.searchController    = new wompt.controllers.Search(this);
	this.searchController.register();
	this.accountsController = new wompt.controllers.Accounts(this);
	this.accountsController.register();
	this.adminController    = new wompt.controllers.Admin(this);
	this.namespacesController.register();
	this.profileController  = new wompt.controllers.Profile(this);
	this.profileController.register();


	// All other requests get a 404
	this.express.get('*', function noRouteFound(req, res, next){
		next(new wompt.errors.NotFound());
	});
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
			// Filter requests based on '/s/' and strip that part when passing throuh to the static server
			var staticServer = express.static(config.public_dir, {maxAge:1000*60*60*24*14}); // 2 weeks
			var exceptions = {
				'/apple-itouch-icon.png':true
				,'/fb_cross_domain.html': true
				,'/google8a88ebb03a6df8aa.html': true
				,'/robots.txt':true
				,'/google5099d06e90a418ce.html': true
			}
			exp.use(function checkStaticAndStrip(req,res,next){
				var url = req.url;
				if(url.substr(0,3) == '/s/'){
					req.url = url.substr(2);
					return staticServer(req, res, next);
				}else if(exceptions[req.url])
					return staticServer(req, res, next);
				else next();
			}); 
			exp.use(express.cookieParser());
			exp.use(express.bodyParser());
			exp.use(wompt.Auth.one_time_token_middleware());
			exp.use(wompt.ParameterAuthentication.middleware(me.accountManager));
			exp.use(wompt.Auth.lookup_user_middleware());
			exp.use(wompt.Auth.anonymous_user_middleware(me.meta_users));
			exp.use(wompt.Auth.meta_user_middleware(me.meta_users));
			
			// User-level error handler (404, 406, ...)
			exp.error(wompt.errors.createPageRenderer(me));
			
			// Application-level error handler (500)
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
			'/support'
			,'/terms'
			,'/privacy'
			,'/contact_us'
		]);
		
		exp.get("/", landingPage);


		exp.post("/", function(req, res){
			wompt.Auth.get_or_set_token(req, res);
			res.redirect('/chat/' + (req.body.channel || 'wompt'));
		});
		
		exp.get("/unlisted/new", function(req, res){
			var name = wompt.Auth.random_string(10);
			res.redirect('/unlisted/' + name);
		});
		
		if(wompt.env.force_sign_in){
			exp.get("/users/force_sign_in/:num", function(req, res){
				var num = parseInt(req.params.num);
				wompt.User.findOne({}, function(err, user){
					if(user){
						wompt.Auth.start_session(res, user);
					}
					res.redirect(req.headers.referer || '/');
				});
			});
		}

		exp.get("/user/sign_out", function(req, res){
			wompt.Auth.sign_out_user(req, res, function(){
				res.redirect(req.headers.referer || '/');
			});
		});
		
		
		function landingPage(req, res){
			var meta_user = req.meta_user,
			token = wompt.Auth.get_or_set_token(req, res);

			var connector = me.client_connectors.add({
				meta_user:meta_user,
				namespace:me.namespacesController.getPublicNamespace('chat').manager,
				token: token
			});
			
			res.render('index', {
				locals: me.standard_page_vars(req, {
					app:me,
					channel: 'general',
					connector_id: connector.id,
					ui:{},
					popout: '/chat/general',
					embedded: true,
					jquery: true,
					page_js: 'channel',					
					page_name:'landing'
				})
			});
		}

		return exp;
	},
	
	standard_page_vars: function(req, custom_vars){
		var vars = {
			jquery: false,
			url: req.url,
			user: req.meta_user,
			authenticated: req.meta_user && req.meta_user.authenticated(),
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
	
	start_server: function(){
		this.express.listen(this.config.port, this.config.host);
		this.start_socket_io();
		
		logger.log("Starting server on port: " + this.config.port);
	},
	
	start_socket_io: function(){
		if(this.socket) return;
		var app = this;
		
		this.socket = SocketIO.listen(this.express, this.config.socketIO.serverOptions);
		this.socket.sockets.on('connection', function(client){
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
				
				var namespace = connector.namespace,
				    user      = connector.meta_user || new wompt.MetaUser();
						
				client.user = user;
				
				if(!client.uid){
					//When the user signs out, we can still know the user id while cleaning up the client
					client.uid = user.id();
					// Because this client didn't have a uid when it was first added
					app.clients.inc_user_count(client);
				}
				
				logger.log('Handing off client:' + client.sessionId + ' to Channel: ' + data.channel)
				namespace.get(data.channel, function(channel){
					if(channel && (user.authenticated() || namespace.options.allowAnonymous)){
						channel.add_client(client, connector && connector.token, data);
						// TODO Create event bubbling feature that allows an event from
						// Channel i.e. "client_added" to bubble up to the ChannelManager
						namespace.addClient(client);
					}
				});
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
