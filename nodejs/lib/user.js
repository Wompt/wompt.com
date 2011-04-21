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
		,'authentications'
	],
	
	methods: {
		wrap: function(){
			return new wompt.MetaUser(this);
		},
		
		signed_up: function(){
			return !!this.email || !!this.name;
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
		
		is_admin: function(){
			return (this.email in {
				'dbeardsl@gmail.com': true,
				'abtinf@gmail.com': true
			});
		}
	}
});

module.exports = db.model('User');

