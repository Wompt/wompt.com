var wompt = require("./includes"),
util = require('util'),
httpProxy = wompt.dependencies.httpProxy;

function Auth(config){
	var me = this;
	this.COOKIE_KEY = config.cookies.token || wompt.fail("Missing environment setting: cookies.token");
	this.ONE_TIME_TOKEN_COOKIE_KEY = config.cookies.one_time || wompt.fail("Missing environment setting: cookies.one_time");
	this.TOKEN_VALID_DURATION = (180 * 24 * 60 * 60 * 1000); // ~6 months
		
	
	this.get_user_from_token = function(token, callback){
		wompt.User.findOne({'sessions.token': token},callback);
	}
	
	this.forward_to_auth_app_middleware = function(){
		var proxy = new httpProxy.RoutingProxy();
		return function(req,res,next){
			if (req.url.match(/^\/auth/)) {
				proxy.proxyRequest(req, res, {
					host: wompt.env.auth_host,
					port: 9292
				});
			}else{
				next();
			}
		}
	}
	
	this.one_time_token_middleware = function(){
		return function(req, res, next){
			var token = req.cookies[me.ONE_TIME_TOKEN_COOKIE_KEY];
			if(token){
				res.clearCookie(me.ONE_TIME_TOKEN_COOKIE_KEY);
				wompt.User.findOne({one_time_token: token}, function(err, user){
					if(user && !err){
						user.one_time_token = null;
						// start_session calls user.save
						var session = me.start_session(res, user);
						req.user = user;
						res.new_session = session;
					}
					next();
				});
			} else
				next();
		}
	}
	
	// Loads the user record by the session token stored in a cookie
	this.lookup_user_middleware = function(){
		return function(req, res, next){
			var token;
			if(req.user || req.sso_anonymous) next();
			else if(token = me.get_token(req)){
				me.get_user_from_token(token, function(err, user){
					if(user && !err) req.user = user;
					next();
				});
			} else next();
		}
	}

	// Creates a temporary MU if the user is anonymous
	this.anonymous_user_middleware = function anonymous_user_middleware(metaUserCollection){
		return function(req, res, next){
			// If there is a user record or an MU we don't need this middleware
			if(req.user || req.meta_user)
				return next();
			
			var token = me.get_token(req), mu;
			
			// If there is a MU for the token, use that, otherwise create one
			mu = metaUserCollection.getOrCreate(token, function(set){
				token = me.set_token(res);
				set(token, new wompt.MetaUser());
			});
			
			mu.touch();
			if(res.new_session) mu.new_session(res.new_session);
			req.meta_user = mu;

			next();
		}
	}
	
	// Loads or creates the MetaUser for authenticated users
	this.meta_user_middleware = function meta_user_middleware(metaUserCollection){
		return function(req, res, next){
			// If there is no user record or the meta user has already been set
			// bail out and don't try to load another MU 
			if(!req.user || req.meta_user)
				return next();
			
			var mu, user_id = req.user._id.toJSON();
	
			// If there is a MU for the user_id, use that, otherwise create one
			// from the user record
			mu = metaUserCollection.getOrCreate(user_id, function(set){
				set(user_id, req.user.wrap());
			});

			mu.touch();
			if(res.new_session) mu.new_session(res.new_session);
			req.meta_user = mu;
			
			next();
		}
	}
	
	// Gives 404 errors for non admins
	this.blockNonAdmins = function(req, res, next){
		if(req.user && req.user.is_admin())
			next();
		else
			next(new wompt.errors.NotFound());
	}
	
	this.start_session = function(res, user){
		var token = this.set_token(res),
		new_session = {
			token: token,
			created_at: new Date().getTime()
		};
		user.sessions.push(new_session);
		user.save();
		return new_session;
	}
	
	this.sign_out_user = function(req, res, callback){
		var token = this.get_token(req);
		var user = req.user;
		this.clear_token(res);
		if(user){
			for(var i = 0; i < user.sessions.length; i++){
				if(user.sessions[i].token == token){
					req.meta_user.end_session(user.sessions[i]);
					user.sessions[i].remove();
				}
			}
			user.save(callback);
		} else callback();
	}
		
		
	this.clear_token = function(response){
		response.cookie(this.COOKIE_KEY, '', {expires: new Date(1), path:'/'});
	}
	
	this.set_token = function(response){
		var token = this.generate_token();
		this.set_cookie(response, token);
		return token;
	}
	
	this.set_cookie = function(response, token){
		response.cookie(this.COOKIE_KEY, token, {path:'/', expires: this.cookie_expires_time()});
	}

	this.get_token = function(request){
		return request.cookies[this.COOKIE_KEY];
	}
	
	this.get_or_set_token = function(request, response){
		return this.get_token(request) || this.set_token(response);
	}

	this.generate_token = function(){
		return this.random_string(16);
	}
	
	this.cookie_expires_time = function(){
		return new Date(new Date().getTime() + this.TOKEN_VALID_DURATION);
	}
	
	var token_chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	this.random_string = function(length) {
		var rand = '';
		for (var i=0; i<length; i++) {
			var rnum = Math.floor(Math.random() * token_chars.length);
			rand += token_chars.substring(rnum,rnum+1);
		}
		return rand;
	}
}

exports.Auth = new Auth(wompt.env);
