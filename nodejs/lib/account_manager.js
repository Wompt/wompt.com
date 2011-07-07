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
		
		if(account){
			account.touch();
			callback(null, account);
		}
		else
			this.load(name, callback);
	},
	
	peek: function(name){
		return this.accounts[name];
	},
	
	load: function(name, callback){
		var self = this;
		Account.findOne({name: name}, function(err, account){
			if(account) self._put(account);
			callback(err, account);
		});
	},
	
	_put: function(account){
		this.accounts[account.name] = account;
		account.touch();
		this.count++;
	},
	
	loadEach: function(callback){
		var self = this;
		Account.find({}, function(err, results){
			if(results){
				results.forEach(function(account){
					self._put(account);
					callback(account);
				});
			}
		});
	},
	
	allAccounts: function(){
		var self = this, results = [];
		for(name in this.accounts){
			results.push(this.accounts[name]);
		}
		return results;
	}
}

AccountManager.prototype = proto;

module.exports = AccountManager;
