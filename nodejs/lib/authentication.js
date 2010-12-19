var wompt = require("./includes")

function Auth(config){
	config = config || {};
	this.COOKIE_KEY = config.cookie_key || '_wompt_auth';
	this.ONE_TIME_TOKEN_COOKIE_KEY = config.one_time_token_cookie_key || 'wompt_auth_one_time_token';
	this.TOKEN_VALID_DURATION = (14 * 24 * 60 * 60 * 1000);
		
	this.authenticate_request = function(req, callbacks){
		var token = this.get_token(req);
		wompt.User.find({sessions: {token: token}}).first(function(doc){
			if(doc)
				callbacks.authenticated(doc, token);
			else
				callbacks.anonymous();

			if(callbacks.after) callbacks.after(doc);
		});
	}
	
	this.get_user_from_token = function(token, callback){
		wompt.User.find({sessions: {token: token}}).first(callback);
	}
	
	this.one_time_token_middleware = function(){
		var me = this;
		return function(req, res, next){
			var token = req.cookies[me.ONE_TIME_TOKEN_COOKIE_KEY];
			res.clearCookie(me.ONE_TIME_TOKEN_COOKIE_KEY);
			if(token){
				wompt.User.find({one_time_token: token}).first(function(user){
					if(user){
						delete user.one_time_token;
						// start_session calls user.save
						me.start_session(res, user);
						req.user = user;
					}
					next();
				});
			} else
				next();
		}
	}
	
	this.lookup_user_middleware = function(){
		var me = this;
		return function(req, res, next){
			if(req.user) next();
			else{
				var token = me.get_token(req);
				if(token){
					me.get_user_from_token(token, function(user){
						if(user) req.user = user;
						next();
					});
				} else next();
			}
		}
	}
	
	this.sign_in_user = function(params, callbacks){
		wompt.User.find({name: params.name}).first(function(doc){
			if(doc){
				callbacks.success && callbacks.success(doc);
			}else if(callbacks.failure) {
				callbacks.failure && callbacks.failure();
			}
		});
	}
	
	this.start_session = function(res, user){
		var token = this.set_token(res);
		user.sessions = [{token: token}];
		user.save();
	}
	
	this.sign_out_user = function(req, res, callbacks){
		var me = this;
		this.authenticate_request(req, {
			authenticated: function(doc, token){
				me.clear_token(res);
				doc.sessions.forEach(function(session, index){
					if(session.token == token)
					delete doc.sessions[index];
				});
				doc.save();
				if(callbacks && callbacks.success) callbacks.success(doc);
			},
			anonymous:callbacks && callbacks.success
		});
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
