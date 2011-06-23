var wompt = require("../includes"),
async = wompt.dependencies.async,
Util = wompt.util;

var base_url = '/accounts';

function AccountsController(app){
	var m = Util.preStackMiddleware(wompt.Auth.blockNonAdmins);
	var stack = Util.stackMiddleware;
	
	this.register = function(){
		app.express.post(base_url + "/:account", this.update);
		app.express.get(base_url + "/:account/analytics", this.analytics);
		app.express.resource('accounts', this);
	}
	
	// url: /accounts
	this.index = m(function index(req, res, next){
		var accounts = app.accountManager.allAccounts();
		res.render('accounts/index', locals(req, {
			accounts: accounts
		}));
	})
	
	// url: /accounts/:id
	this.show = stack(loadAccountOwners, allowOwnersAndAdmins, function show(req, res, next){
		res.render('accounts/show', locals(req, {
			account: req.account
			,account_owners: req.account_owners
			,namespace: app.namespaces[req.account.name]
		}));
	})
	
	// url: /accounts/new
	this.new = m(function _new(req, res, next){
		res.render('accounts/new', locals(req));
	})
	
	// url: /accounts/edit/:id
	this.edit = m(loadAccountOwners, function edit(req, res, next){
		res.render('accounts/edit', locals(req));
	})
	
	// url: /accounts/edit/:id
	this.update = m(function update(req, res, next){
		var redirect_to = base_url + '/' + req.account.name;
		
		if(req.body.add_owner_id){
			req.account.owner_ids.push(wompt.mongoose.Types.ObjectId.fromString(req.body.add_owner_id));
			req.account.save(function(){
				res.redirect(redirect_to);
			});
		} else
			res.redirect(redirect_to);
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
			else{
				res.redirect(base_url);
				app.accountManager._put(account);
			}
		})
	})
	
	this.analytics = stack(allowOwnersAndAdmins, function analytics(req, res, next){
		async.parallel({
			'daily': function(callback){
				req.account.findStats({frequency:'day'})
				.limit(30)
				.run(callback);			},
			'hourly': function(callback){
				req.account.findStats({frequency:'hour'})
				.limit(24)
				.run(callback);
			}
		},
		function done(err, results){
			if(err)
				next(err);
			else{
				res.render('accounts/analytics', locals(req, {
					stats:formatResults(results)
				}));
			}
		});
		
		function formatResults(results){
			var columns = ['t', 'peak_connections', 'connections'];
			return {
				hourly:transpose(results.hourly, columns),
				daily:transpose(results.daily, columns)
			}
		}

		function transpose(records, columns){
			var results = {};
			columns.forEach(function(column){
				results[column] = records.map(function(record){
					return record[column];
				})
			});
			
			if(results.t)
				results.t = results.t.map(function(t){return t.getTime();});
			
			return results;
		}
	});
	
	// called for each of the above actions that use an :id sets req.account
	this.load = function loadAccount(name, fn){
		app.accountManager.get(name, fn);
	}

	function locals(req, opt){
		opt = opt || {};
		opt.page_name = 'accounts';
		return app.standard_page_vars(req, opt);
	}

	function loadAccountOwners(req,res,next){
		req.account_owners = [];
		
		if(req.account.owner_ids.length > 0){
			wompt.User.find({_id: {$in: req.account.owner_ids.toObject()}}, function(err, results){
				req.account_owners = results;
				next();
			});
		} else
			next()
	}
	
	function allowOwnersAndAdmins(req, res, next){
		if(req.user && (req.user.is_admin() || req.account.owner_ids.indexOf(req.user.id) >= 0))
			next();
		else
			next(new wompt.errors.NotFound());
	}
}

module.exports = AccountsController
