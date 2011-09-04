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
p.get = function getMU(id){
	return this.meta_users[id];
}

// Get a MU by ID or call the provided function and pass the "set" function
// which is the same as like this.set()
// returns the existing MU or the created one.
p.getOrCreate = function getOrCreateMU(id, create){
	var result, self = this;
	
	function set(id, object){
		result = self.set(id, object);
	}
	
	return self.get(id) || (create(set) || result);
}

p.set = function setMU(id, mu){
	return this.meta_users[id] = mu;
}
module.exports = MetaUserManager;
