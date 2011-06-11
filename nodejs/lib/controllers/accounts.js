var wompt = require("../includes");

function AccountsController(app){
	this.index = function(req, res, next){
		if(blockNonAdmins(req, res, next)) return;
		res.end('Hello Admin');
	}
	
	this.load = function loadAccount(name, fn){
		app.accountManager.get(name, fn);
	}
}


function blockNonAdmins(req, res, next){
	if(req.user && req.user.is_admin()){
		return false;
	}else{
		next(new wompt.errors.NotFound());
		return true;
	}
}

module.exports = AccountsController
