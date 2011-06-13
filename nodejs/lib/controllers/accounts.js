var wompt = require("../includes"),
Util = wompt.util;

function AccountsController(app){
	var m = Util.preStackMiddleware(wompt.Auth.blockNonAdmins);
	
	// url: /accounts
	this.index = m(function index(req, res, next){
		var accounts = app.accountManager.allAccounts();
		res.render('accounts/index', locals(req, {
			accounts: accounts
		}));
	})
	
	// url: /accounts/:id
	this.show = m(function show(req, res, next){
		res.render('accounts/show', locals(req, {
			account: req.account
			,namespace: app.namespaces[req.account.name]
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

module.exports = AccountsController
