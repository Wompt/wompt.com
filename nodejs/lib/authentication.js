var wompt = require("./includes"),
    httpProxy = require('http-proxy');

function Auth(config){
	config = config || {};
	var me = this;
	this.COOKIE_KEY = config.cookie_key || '_wompt_auth';
	this.ONE_TIME_TOKEN_COOKIE_KEY = config.one_time_token_cookie_key || 'wompt_auth_one_time_token';
	this.TOKEN_VALID_DURATION = (14 * 24 * 60 * 60 * 1000);
		
	
	this.get_user_from_token = function(token, callback){
		wompt.User.findOne({'sessions.token': token},callback);
	}
	
	this.forward_to_auth_app_middleware = function(){
		return function(req,res,next){
			if (req.url.match(/^\/auth/)) {
				var proxy = new httpProxy.HttpProxy(req, res);
				proxy.proxyRequest(9292, wompt.env.auth_host);
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
	
	this.lookup_user_middleware = function(){
		var token;
		return function(req, res, next){
			if(req.user) next();
			else if(token = me.get_token(req)){
				me.get_user_from_token(token, function(err, user){
					if(user && !err) req.user = user;
					next();
				});
			} else next();
		}
	}
	
	this.meta_user_middleware = function(collection){
		return function(req, res, next){
			var mu;
			if(req.meta_user)
				mu = req.meta_user;
			else if(req.user){
				var lookup = collection.get(req.user._id.id);
				if(lookup){
					mu = lookup;
				} else {
					mu = req.user.wrap();
					collection.set(req.user._id.id, mu);
				}
			}	else {
				var token = me.get_token(req),
				    lookup = collection.get(token);
				if(lookup){
					mu = lookup;
				} else {
					mu = new wompt.MetaUser();
					collection.set(token, mu);
				}
			}
			mu.touch();
			if(res.new_session) mu.new_session(res.new_session);
			req.meta_user = mu;
			
			next();
		}
	}
	
	this.adminMiddleware = function(req, res, next){
		if(req.user && req.user.is_admin())
			next();
		else{
			res.send("", 404);
			res.end();
		}
	}
	
	this.start_session = function(res, user){
		var token = this.set_token(res),
		    new_session = {token: token};
		user.sessions.push(new_session);
		user.save();
		return new_session;
	}
	
	this.sign_out_user = function(req, res, callbacks){
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
			user.save();
		}
	}
		
		
	this.clear_token = function(response){
		response.clearCookie(this.COOKIE_KEY);
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

exports.Auth = new Auth();
