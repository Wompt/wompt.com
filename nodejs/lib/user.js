var wompt = require("./includes"),
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
	,'last_ip'      : String
	,'session_id'   : String
	,'last_used'    : Date
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
	
	signed_up: function(){
		return !!this.email || !!this.name;
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

module.exports = mongoose.model('User');
