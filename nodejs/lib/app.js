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
	this.channels =	this.chatNamespace('chat', {logged: true, allowIframe: true});

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
			exp.use(express.static(config.public_dir, {maxAge:1000*60*60*24*14})); // 2 weeks
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
		
		exp.get("/", landingPage);

		exp.get("/profile", function(req, res){
			if(req.meta_user && req.meta_user.authenticated())
				res.redirect('/users/' + req.meta_user.id())
			else
				res.redirect('/');
		});
		
		exp.get("/users/:id", function(req, res){
			if(req.params.id && req.user && req.meta_user.id() == req.params.id){
				//User record is already loaded but auth middleware, no need to load again
				profilePage(req, res, req.user);
			}
			else{
				wompt.User.findById(req.params.id, function(err, user){
					profilePage(req, res, user);
				});
			}
		});
		
		exp.get("/channels/search", function(req, res){
			var results = [], term, terms, max_results = 10;
			(term = req.query) && (term = term.term) && (term = term.toLowerCase());
			// Limit length, split on spaces, remove blank terms, enforce maximum term count
			terms = term.substr(0,50).split(' ').filter(function(t){return t.length > 0 ;}).slice(0,5);
			
			if(terms.length > 1){
				me.channels.each(function(channel){
					var name = channel.name;
					if(terms.every(function(term){return name.indexOf(term) >= 0;})) results.push(channel);
					if(results.length >= max_results) return true;
				});
			} else if(term = terms[0]){
				me.channels.each(function(channel){
					if(channel.name.indexOf(term) >= 0) results.push(channel);
					if(results.length >= max_results) return true;
				});
			}
			results = results.map(function(channel){ return channel.name});
			
			res.writeHead(200, {"Content-Type":"application/json"});
			res.end(JSON.stringify(results));
		});
		
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
		
		exp.get("/admin/stats", wompt.Auth.adminMiddleware, function(req, res){
			res.render('admin/stats', {
				locals: {w: me},
				layout: 'admin/layout'
			});
		});
		
		function landingPage(req, res){
			var meta_user = req.meta_user,
			token = wompt.Auth.get_or_set_token(req, res);

			var connector = me.client_connectors.add({
				meta_user:meta_user,
				namespace:me.channels,
				token: token
			});
			
			res.render('index', {
				locals: me.standard_page_vars(req, {
					app:me,
					channel: 'wompt',
					namespace: 'chat',
					connector_id: connector.id,
					popout: '/chat/wompt',
					jquery: true,
					page_js: 'channel',					
					page_name:'landing'
				})
			});
		}
		
		function profilePage(req, res, user){
			if(!user) return res.send("", 404);
			
			res.render('profile', {
				locals: me.standard_page_vars(req, {
					app:me,
					profileUser: user,
					jquery: true,
					page_js: 'profile'
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
		
		var argumentsForGet = [new RegExp("\\/" + namespace + "\\/(.+)")];
		if(options.fakeUsers) argumentsForGet.push(wompt.Auth.fake_user_middleware());
		
		function handleChatRoomGet(req, res){
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
			
			var opt = {
				locals:locals
			};
			
			if(options.allowIframe && req.query.iframe == '1'){
				opt.layout = 'layouts/iframe';
				locals.w.ga_source = 'embedd';
				// Disable google analytics when embedding wompt on a wompt page
				locals.w.disable_ga = (req.headers.referer || '').indexOf("wompt.com") >=0;
				if(options.allowCSS) locals.w.css_file = req.query.css_file;
			}
			
			res.render('chat', opt);
		}
		
		argumentsForGet.push(handleChatRoomGet);
		exp.get.apply(exp, argumentsForGet);
		
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
