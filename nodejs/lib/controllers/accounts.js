var wompt = require("../includes");

function AccountsController(app){
	this.index = blockNonAdmins(function index(req, res, next){
		wompt.Account.find(function(err, results){
			res.render('accounts/index', app.standard_page_vars(req, {
				accounts: results
			}));
		});
	})
	
	this.show = blockNonAdmins(function show(req, res, next){
		res.render('accounts/show', app.standard_page_vars(req, {
			account: req.account
		}));
	})
	
	this.new = blockNonAdmins(function _new(req, res, next){
		res.render('accounts/new', app.standard_page_vars(req));
	})
	
	this.create = blockNonAdmins(function create(req, res, next){
		var account = new wompt.Account();
		['name'].forEach(function(key){
			account[key] = req.body[key];
		});
		account.save(function(err){
			if(err)
				next(err);
			else
				res.redirect('/accounts');
		})
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
