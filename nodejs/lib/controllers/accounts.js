var wompt = require("../includes");

function AccountsController(app){
	// url: /accounts
	this.index = blockNonAdmins(function index(req, res, next){
		wompt.Account.find(function(err, results){
			res.render('accounts/index', locals(req, {
				accounts: results
			}));
		});
	})
	
	// url: /accounts/:id
	this.show = blockNonAdmins(function show(req, res, next){
		res.render('accounts/show', locals(req, {
			account: req.account
		}));
	})
	
	// url: /accounts/new
	this.new = blockNonAdmins(function _new(req, res, next){
		res.render('accounts/new', locals(req));
	})
	
	// url: POST /accounts
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
	
	// called for each of the above actions that use an :id sets req.account
	this.load = function loadAccount(name, fn){
		app.accountManager.get(name, fn);
	}
	
	function locals(req, opt){
		if(opt) opt.page_name = 'accounts';
		return app.standard_page_vars(req, opt);
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
