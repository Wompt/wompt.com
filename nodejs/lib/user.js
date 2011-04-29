var wompt = require("./includes"),
    db = wompt.db;

wompt.mongoose.model('User',{

	collection : 'users',

	properties: [
		//simple attributes
		 'name'
		,'email'
		,'one_time_token'
		
		// embedded documents
		,{
		'sessions': [
			['token', 'last_ip', 'session_id', 'last_used']
		]
		,'authentications': [
			['provider','uid']
		]
		}
	],
	
	indexes : [
		 'email'
		,'sessions.token',
		,{'authentications.uid':1,'authentications.provider':1}
	],
	
	methods: {
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
	}
});

module.exports = db.model('User');

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
	}
}

function get_urls_hash(auth){
	var i;
	return (i = auth.info) && (i = i.user_info) && (i = i.urls) || {};
}
