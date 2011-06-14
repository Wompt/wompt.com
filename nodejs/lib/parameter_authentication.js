var wompt = require("./includes"),
util = require('util');

var MAX_REQUEST_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Looks up the account for a request
// for a url of /account_name/room_name
// this sets req.account = Account.find(name==account_name) 
function lookupAccountMiddleware(accountManager){
	return function(req,res,next){
		var account_name = wompt.util.extractFirstUrlPart(req);

		var account = accountManager.peek(account_name);
		if(account) req.account = account;
		
		// if an account is not found, bail out of the rest of the stack,
		// see Util.preStackMiddleware
		next(null, !account);
	}
}

// Verifies the url query params against the hashed secret stored in the account
// that was loaded into req.account
function verifyAuthenticity(req, res, next){
	if(req.account){   //  /account_name/(room_name?query_parameters)&secure=blah
		var match = req.url.match(/^\/[^\/]+\/(.*\?.*)&secure=\w+$/),
		query = match && match[1],
		secureStr = query && query.length > 0 && wompt.util.sha1(query + req.account.secret);
		
		if(secureStr && secureStr == req.query.secure && verifyTimeliness(req))
			return next()
	}

	// Didn't pass validation, respond with error.
	return next(new wompt.errors.NotAuthorized());
}

function verifyTimeliness(req){
	return Math.abs(Date.now() - parseInt(req.query.ts, 10)) < MAX_REQUEST_AGE_MS;
}

// Loads req.user based on req.account and the user_id query param
function loadUserBasedOnQueryParam(req, res, next){
	if(req.account && req.query.user_id){
		wompt.User.findOne({account_id: req.account.id, account_user_id: req.query.user_id}, function(err, user){
			if(user){
				req.user = user;
				next();
			}else{
				createUserFromQueryParams(req, function(err, user){
					if(user) req.user = user;
					next(err);				
				});
			}
		})
	}
	// if there is no user_id or no account, bail out of the rest of the stack
	// see Util.preStackMiddleware
	else
		next(null, true);
}

function createUserFromQueryParams(req, callback){
	var q = req.query;
	var user = new wompt.User({
		account_id: req.account.id,
		account_user_id: q.user_id,
		name: q.user_name
	});
	
	user.save(callback);
}

function parameterAuthorization(accountManager){
	return wompt.util.stackMiddleware(
		lookupAccountMiddleware(accountManager),
		verifyAuthenticity,
		loadUserBasedOnQueryParam
	);
}

exports.middleware = parameterAuthorization;
