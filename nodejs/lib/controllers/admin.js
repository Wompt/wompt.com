var wompt = require("../includes"),
Util = wompt.util;

function Admin(app){
	var express = app.express,
	m = Util.preStackMiddleware(wompt.Auth.blockNonAdmins);
	
	express.get("/admin/stats", m(function(req, res){
		res.render('admin/stats', locals(req, {app:app}))
	}));
	
	function locals(req, opt){
		opt = opt || {};
		opt.page_name = 'admin';
		return app.standard_page_vars(req, opt);
	}	
}

module.exports = Admin;
