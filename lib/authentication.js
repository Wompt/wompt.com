var wompt = require("./includes")

function Auth(config){
	config = config || {};
	this.COOKIE_KEY = config.cookie_key || '_wompt_auth';
	this.TOKEN_VALID_DURATION = (14 * 24 * 60 * 60 * 1000);
		
	this.authenticate_client = function(client, callbacks){
		var token = this.get_token(client.request);
		wompt.User.find({sessions: {token: token}}).first(function(doc){
			if(doc)
				callbacks.authenticated(client, doc);
			else
				callbacks.anonymous(client, doc);

			if(callbacks.after) callbacks.after(client, doc);
		});
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
