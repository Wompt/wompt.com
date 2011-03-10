var wompt = require("./includes"),
    db = wompt.db,
    mongoose = wompt.mongoose;

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var Authentication = new Schema({
	'provider'      : String
	,'uid'          : String
});

// number defines index sort order
Authentication.index({provider: 1, uid:1});

var Session = new Schema({
	'token'         : {type: String, index:true}
	,last_used      : Date
	,created_at     : Date
});


var User = new Schema({
	//simple attributes
	'name'             : String
	,'email'           : {type: String, index:true}
	,'one_time_token'  : String
	
	// embedded documents
	,'sessions'        : [Session]
	,'authentications' : [Authentication]
});
	
User.method({
	wrap: function(){
		return new wompt.MetaUser(this);
	},
		
	authentication_for: function(provider){
		var auths = this.authentications ;
		if(!auths) return null;
		var auth;
		for(var i=0; auth=auths[i]; i++){
			if(auth['provider'] == provider) return auth;
		}
		return null;
	},
	
	provider_attribute: function(provider, attr){
		var info       = this.authentication_for(provider),
		provider_info  = info          && providerAuthInfo[provider],
		attr_getter    = provider_info && provider_info[attr];
		return attr_getter && attr_getter.call(info);
	},
	
	same_user: function(u){
		return u && (u == this || this._id.id == u._id.id);
	},
	
	is_admin: function(){
		return (this.email in {
			'dbeardsl@gmail.com': true,
			'abtinf@gmail.com': true
		});
	}
});

// Model name, Schema, collection name
mongoose.model('User', User, 'users');

var providerAuthInfo = {
	facebook: {
		profile: function(){
			return get_urls_hash(this).Facebook || "http://facebook.com/profile.php?id=" + this.uid;
		}
	},
	
	github: {
		profile: function(){
			var url = get_urls_hash(this).GitHub;
			return url || "http://facebook.com/profile.php?id=" + this.uid;
		}
	},
	
	google: {
		profile: function(){
			var name;  // auth.info.user_info.email
			(name = this.info) &&
			(name = name.user_info) &&
			(name = name.email) &&
			(name = name.split('@')[0]);
			return name ? 'http://profiles.google.com/' + name : null;
		}
	}
}

function get_urls_hash(auth){
	var i;
	return (i = auth.info) && (i = i.user_info) && (i = i.urls) || {};
}

module.exports = db.model('User');

