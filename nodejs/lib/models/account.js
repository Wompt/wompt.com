var wompt = require("../includes"),
mongoose = wompt.mongoose,
ObjectId = mongoose.Schema.ObjectId;

var Account = new mongoose.Schema({
	'display_name'    : String
	,'name'           : String
	,'owner_ids'      : [ObjectId]
	,'domains'        : [String]
	,'secret'         : {type: String, 'default': generateSecret}
	,'role'           : String
	,'profile_url_template': String
	
	,'useWordFilter'  : Boolean
	,'wordFilter'     : [String]
});

// number defines index sort order (1=asc)
Account.index({name: 1});

Account.method({
	// touched is not saved and is only used for expiring the account record cache
	touch: function(){
		this.touched = new Date();
	},
	
	findStats: function findStats(){
		var opts = arguments[0];
		opts.account_id = this._id;
		return wompt.models.AccountStats
			.find.apply(wompt.models.AccountStats, arguments)
			.sort('t', -1);
	},
	
	isValidDomain: function isValidDomain(domain_to_check){
		var domains = this.domains;
		for(var i=0; i<domains.length; i++){
			var domain = domains[i];
			if(domain_to_check == domain) return true;
		}
		return false;
	},
	
	hasFeature: function hasFeature(featureName){
		var permissions = wompt.roles[this.role];
		return permissions && permissions[featureName];
	},
	
	featureSet: function(){
		return wompt.roles[this.role] || wompt.roles.default;
	},
	
	baseUrl: function baseUrl(){
		return 'http://wompt.com/a/' + this.name + '/';
	}
})

Account.static({
	generateSecret: generateSecret
});

// Model name, Schema, collection name
mongoose.model('Account', Account, 'accounts');
module.exports = mongoose.model('Account');

function generateSecret(){
	return wompt.util.randomString(20);
}
