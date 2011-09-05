var wompt = require("./includes"),
Url = require('url'),
util = require('util');

var MAX_REQUEST_AGE = 24 * 60 * 60; // 24 hours in seconds

// Looks up the account for a request
//
// for a url of /a/account_name/room_name
// this sets req.account = Account.find(name==account_name)
//
function lookupAccountMiddleware(accountManager){
	return function(req,res,next){
		var parts = wompt.util.urlParts(req);
		if(parts[1] != 'a') return next(null, 'break');

		accountManager.get(parts[2], function(err, account){
			req.account = account;
			// if an account is not found, bail out of the rest of the stack,
			// see Util.preStackMiddleware
			next(null, account ? null : 'break');
		});
	}
}

// Verifies that the referring domain is on the list of authroized domains for
// the account that owns this namespace
//
function verifyDomain(req, res, next){
	var referer = req.headers.referer;
	// Only try to verify the domain if there is a referer and the iframe layout
	// is being used
	if(req.query.iframe == '1'){
		
		// blank referer means the page was visited directly, so render it in regular mode.
		if(!referer){
			delete req.query.iframe;
			return next();
		}
		
		var hostname = Url.parse(referer).hostname;
		if(hostname && req.account.isValidDomain(hostname))
			return next()
		else
			return next(new wompt.errors.NotAuthorized(referer + " needs to be added to the list of authorized domains for this account."));
	} else { 
		// All rooms are accessible in regular layout mode
		next()
	} 
}


// Verifies the url query params against the hashed secret stored in the account
// that was loaded into req.account
//
function verifyAuthenticity(req, res, next){
	// if there is no account, or the account does't have SSO, break out of
	// the rest of this stack
	if(!req.account || !req.account.hasFeature('sso'))
		return next(null, 'break');

	//  /account_name/(room_name?query_parameters)&secure=blah
	var match = req.url.match(/\/a\/[^\/]+\/(.*\?.*)&secure=\w+$/),
	query = match && match[1],
	secureStr = query && query.length > 0 && wompt.util.sha1(query + req.account.secret);
	
	if(secureStr && secureStr == req.query.secure && verifyTimeliness(req))
		// passed parameter security validation
		return next()
	else
		// Didn't pass validation, respond with error.
		return next(new wompt.errors.NotAuthorized());
}

function verifyTimeliness(req){
	return Math.abs(Date.now()/1000 - parseInt(req.query.ts, 10)) < MAX_REQUEST_AGE;
}

// Loads req.user based on req.account and the user_id query param
function loadUserBasedOnQueryParam(req, res, next){
	if(req.account){
		if(req.query.user_id){
			wompt.User.findOne({account_id: req.account.id, account_user_id: req.query.user_id},
			function(err, user){
				if(user){
					req.user = user;
					next();
				}else{
					createUserFromQueryParams(req, function(err, user){
						if(user)
							req.user = user;
						return next(err);				
					});
				}
			})
		} else if(req.query.anonymous === '1') { // no user_id parameter, check for anonymous=
			req.sso_anonymous = true;
			req.meta_user = new wompt.MetaUser();
			return next();
		}
	}
	// if there is no user_id or no account, bail out of the rest of the stack
	// see Util.preStackMiddleware
	else
		next(null, 'break');
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
		verifyDomain,
		verifyAuthenticity,
		loadUserBasedOnQueryParam
	);
}

exports.middleware = parameterAuthorization;
