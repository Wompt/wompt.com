var wompt = require("./includes"),
    db = wompt.db,

MetaUser = function(doc){
	this.clients = new wompt.ClientPool();
	this.doc = doc
};

wompt.mongoose.model('User',{

	collection : 'users',

	properties: [
		 'name'
		,'email'
		,{'sessions': [
			['token', 'last_ip', 'session_id', 'last_used']
		]}
	],
	
	indexes : [
		 'email'
		,'sessions.token'
	],
	
	methods: {
		wrap: function(){
			return new MetaUser(this);
		}
	}
});

module.exports = db.model('User');

