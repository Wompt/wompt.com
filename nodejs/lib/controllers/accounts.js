var wompt = require("../includes");

function AccountsController(app){
	this.index = blockNonAdmins(function index(req, res, next){
		res.end('Hello Admin');
	})
	
	this.new = blockNonAdmins(function _new(req, res, next){
		res.render('accounts/new', app.standard_page_vars(req));
	})
	
	this.create = blockNonAdmins(function create(req, res, next){
		console.log("Account created: ");
		console.dir(req.body);
		res.redirect('/accounts');
	})
	
	this.load = function loadAccount(name, fn){
		app.accountManager.get(name, fn);
	}
}


function blockNonAdmins(handler){
	return function blockNonAdmins(req, res, next){
		if(req.user && req.user.is_admin())
			handler(req, res, next);
		else
			next(new wompt.errors.NotFound());
	}
}

module.exports = AccountsController
