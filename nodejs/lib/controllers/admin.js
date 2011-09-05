var wompt = require("../includes"),
Util = wompt.util;

function Admin(app){
	var express = app.express,
	m = Util.preStackMiddleware(wompt.Auth.blockNonAdmins);
	
	express.get("/admin/stats", m(function(req, res){
		res.render('admin/stats', locals(req, {app:app}))
	}));
	
	express.get("/admin/embed_test", m(function(req, res){
		app.accountManager.get('testing_paid', function(err, account){
			var crypto = require('crypto'),
			    base_url,
			    query,
			    url,
			    secret;
			
			function sha1(str){
				return crypto.createHash('sha1').update(str).digest("hex");
			}
			
			base_url = "/a/" + account.name + '/';
			if(req.query.anonymous === '1'){
				query = ['room1?',
								 'anonymous=1',
								 'ts=' + Math.floor(Date.now()/1000)].join('&');
			} else {
				query = [
					"room1?",
					"user_id=______" + (req.query.user_id || "test_user"),
					"user_name=" + encodeURIComponent(req.query.user_name || "Test User"),
					"ts=" + Math.floor(Date.now()/1000)
					].join('&');
			}
			secret = account.secret;
			url = base_url + query + "&secure=" + sha1(query + secret);
			
			res.render('admin/embed_test', locals(req, {app:app, url_for_embed: url}));
		})
	}));
	
	function locals(req, opt){
		opt = opt || {};
		opt.page_name = 'admin';
		return app.standard_page_vars(req, opt);
	}	
}

module.exports = Admin;
