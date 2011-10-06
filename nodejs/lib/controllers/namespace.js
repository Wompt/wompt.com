var wompt = require("../includes"),
Util = wompt.util;

function NamespaceController(app){
	var express = app.express,
	self = this;
	var public_namespaces = {},
	account_namespaces = {};
	
	this.register = function(){
		
		function createNamespaceFilter(type){
			return function lookupNamespace(req, res, next){
				var namespace_id = req.params.namespace,
				namespace;
				
				if(type == 'account')
					namespace = self.getOrCreateNamespaceForAccount(req.account);
				else if(type == 'public')
					namespace = self.getPublicNamespace(namespace_id);
				
				if(namespace){
					var room_name = req.params[0];
					if(req.headers.reauthenticate){
						return self.reAuthenticateUser(req, res, next, namespace.manager);
					}
					req.params.room_name = room_name;
					namespace.handler.apply(this, arguments);
				}else
					next();
			}
		}
		
		// Public namespaces are accesible at /namespace
		express.get("/:namespace/*", createNamespaceFilter('public'));

		// Namespaces owned by accounts are assessible at /a/namespace
		express.get("/a/:namespace/*", createNamespaceFilter('account')); 
	}

	this.reAuthenticateUser = function reAuthenticateUser(req, res, next, channelManager){
		if(req.meta_user){
			var token = wompt.Auth.get_or_set_token(req, res);
			var connector = app.client_connectors.add({
				namespace:channelManager,
				meta_user:req.meta_user,
				token: token
			});
			res.send({connector_id:connector.id, version_hash:wompt.env.constants.version_hash});
		}else next();
	}

	this.getPublicNamespace =
	function getPublicNamespace(namespace_id){
		var namespace = namespace_id && public_namespaces[namespace_id];
		return namespace && namespace;
	}

	this.getNamespaceForAccount =
	function getNamespaceForAccount(namespace_id){
		var namespace = namespace_id && account_namespaces[namespace_id];
		return namespace && namespace;
	}

	this.getOrCreateNamespaceForAccount =
	function getOrCreateAccountNamespace(account){
		if(!account) return null;
		
		var namespace = account && account_namespaces[account.name];
		
		return namespace || this.createNamespaceForAccount(account);
	}


	this.eachNamespace = function eachNamespace(callback){
		for(var id in public_namespaces){
			callback(public_namespaces[id].manager);
		}

		for(var id in account_namespaces){
			callback(account_namespaces[id].manager);
		}
	}

	
	this.createNamespaceForAccount = function(account){
		var namespace = createNamespace(account.name, {
			logDirectory: 'accounts/' + account.name,
			allowAnonymous: true
		});
		
		var stats = new wompt.monitors.NamespaceStats(namespace.manager, {intervals: ['hour', 'day']});
		stats.on('stats', function(interval, info){
			info.frequency = interval;
			info.account_id = account._id;
			var rec = new wompt.models.AccountStats(info);
			rec.save();			
		});
		
		account_namespaces[account.name] = namespace;
		
		namespace.manager.stats = stats;
		account.channelManager = namespace.manager;
		return namespace;
	}


	this.createPublicNamespace = function(namespace_id){
		var namespace =	createNamespace.apply(this, arguments);
		public_namespaces[namespace_id] = namespace;
		return namespace;
	}


	function createNamespace(namespace_id, options){
		options = Util.mergeDeep({
			logged: true,
			allowIframe: true,
			logDirectory: namespace_id
		}, options || {});
		
		options.namespace = namespace_id;

		var	channelManager = new wompt.ChannelManager(options);
		
		if(options.logged){
			new wompt.loggers.LoggerCreator(channelManager, options.logDirectory);
		}
		
		function handleChatRoomGet(req, res){
			var customOptions = options;
			
			if(req.account){
				var features = req.account.featureSet();
				customOptions = {
					allowIframe: true,
					allowCSS: features.css_override,
					forceEmbedStyle: features.sso,
					ui:{
						hidePopout: features.sso,
						hideSocialLinks: features.sso,
						hideProfileLinks: !!(!req.account.profile_url_template && features.sso),
						profileUrlTemplate : features.sso && req.account.profile_url_template,
						signInUrl          : features.sso && req.account.sign_in_url,
						wordFilter: req.account.useWordFilter && req.account.wordFilter
					}
				};
			}

			// Trim off ending slash
			if(req.url.substr(-1,1) == '/')
				return res.redirect(wompt.util.chop(req.url));
				
			// Trim off ending slash when we have query parameters
			if(req.url.indexOf('/?') >=0){
				req.url = req.url.replace('/?', '?');
				req.params.room_name = wompt.util.chop(req.room_name);
			}

			var meta_user = req.meta_user,
					channel = req.params.room_name;
					
			var token = wompt.Auth.get_or_set_token(req, res);

			var connector = app.client_connectors.add({
				meta_user:meta_user,
				namespace:channelManager,
				token: token
			});
			
			var locals = app.standard_page_vars(req, {
				channel: channel,
				connector_id: connector.id,
				url: req.url,
				ui: customOptions.ui || {},
				jquery: true,
				page_name: 'chat',
				page_js: 'channel'
			});
			
			var opt = {
				locals:locals
			};
			
			if(customOptions.forceEmbedStyle || (customOptions.allowIframe && req.query.iframe == '1')){
				opt.layout = 'layouts/iframe';
				locals.w.embedded = true;
				locals.w.ga_source = 'embedd';
				if(options.allowCSS) locals.w.css_file = req.query.css_file;
			}
			
			res.render('chat', opt);
		}
		
		return {
			handler:  handleChatRoomGet
			,manager: channelManager
		}
	}
}

module.exports = NamespaceController;
