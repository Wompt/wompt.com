var wompt = require("../includes"),
Util = wompt.util;

function AccountsController(app){
	var m = Util.preStackMiddleware(blockNonAdmins);
	
	// url: /accounts
	this.index = m(function index(req, res, next){
		wompt.Account.find(function(err, results){
			res.render('accounts/index', locals(req, {
				accounts: results
			}));
		});
	})
	
	// url: /accounts/:id
	this.show = m(function show(req, res, next){
		res.render('accounts/show', locals(req, {
			account: req.account
		}));
	})
	
	// url: /accounts/new
	this.new = m(function _new(req, res, next){
		res.render('accounts/new', locals(req));
	})
	
	// url: /accounts/edit/:id
	this.edit = m(function edit(req, res, next){
		res.render('accounts/edit', locals(req));
	})	
	
	// url: POST /accounts
	this.create = m(function create(req, res, next){
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
	
	// called for each of the above actions that use an :id sets req.account
	this.load = function loadAccount(name, fn){
		app.accountManager.get(name, fn);
	}
	
	function locals(req, opt){
		opt = opt || {};
		opt.page_name = 'accounts';
		return app.standard_page_vars(req, opt);
	}
}

function blockNonAdmins(req, res, next){
	if(req.user && req.user.is_admin())
		next();
	else
		next(new wompt.errors.NotFound());
}

module.exports = AccountsController
