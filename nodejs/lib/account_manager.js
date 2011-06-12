var wompt  = require("./includes")
   ,Account = wompt.Account;

function AccountManager(options){
	var self = this;
	this.accounts = {};
	this.count = 0;
	this.options = options;
	this.expirer = new wompt.Expirer(this.accounts, {
		expire_after_ms: 24 * 60 * 60 * 1000, // 24 hours
		time_attribute:'touched'
	});
	this.expirer.on('expired', function(account){
		self.count--;
	});
}

var proto = {
	get: function(name, callback){
		var account = this.peek(name);
		
		if(account)
			callback(account);
		else
			this.load(name, callback);
	},
	
	peek: function(name){
		return this.accounts[name];
	},
	
	load: function(name, callback){
		var self = this;
		Account.findOne({name: name}, function(err, account){
			if(account){
				self.accounts[name] = account;
				self.count++;
			}
			callback(err, account);
		});
	}
}

AccountManager.prototype = proto;

module.exports = AccountManager;
