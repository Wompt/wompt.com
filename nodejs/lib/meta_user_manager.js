var wompt = require('./includes');

function MetaUserManager(){
	this.meta_users = {};
	this.expirer = new wompt.Expirer(this.meta_users,{
		keep_if: function(mu){
			return mu.clients.count > 0;
		},
		time_attribute:'touched'
	});
}

var p = MetaUserManager.prototype;
p.get = function(id){
	return this.meta_users[id];
}

p.set = function(id, mu){
	this.meta_users[id] = mu;
}

module.exports = MetaUserManager;
