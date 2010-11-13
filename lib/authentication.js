var wompt = require("./includes")

function Auth(config){
	config = config || {};
	this.COOKIE_KEY = config.cookie_key || '_wompt_auth';
		
	this.find_user_by_token = function(token){
		return wompt.User.find_by_token(token);
	}
	
	this.authenticate_client = function(client, callbacks){
		var token = this.get_token(client.request);
		var user = this.find_user_by_token(token);

		callbacks.success(client, user);
	}
	
	this.set_token = function(response){
		var token = this.generate_token();
		response.setCookie(this.COOKIE_KEY, token);
		return token;
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
