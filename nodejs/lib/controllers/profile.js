var wompt = require("../includes"),
Util = wompt.util;

function ProfileController(app){
	var express = app.express,
	self = this;
	
	this.register = function(){
		express.get("/users/:id", renderProfile);
		express.post("/profile", changeSettings);
		express.get("/profile", ownProfilePage);		
	}
	
	function renderProfile(req, res){
		if(req.params.id && req.user && req.meta_user.id() == req.params.id){
			//User record is already loaded by auth middleware, no need to load again
			profilePage(req, res, req.user);
		}
		else{
			wompt.User.findById(req.params.id, function(err, user){
				profilePage(req, res, user);
			});
		}
	}
	
	function changeSettings(req, res){
		var b = req.body;
		if(b.useNameFrom){
			var name = req.user.provider_attribute(b.useNameFrom, 'name');
			if(name && name.length > 2){
				req.user.name = name
				req.user.save();
			}
			res.send({name:req.user.name}, 200);
		} else next(new wompt.errors.NotAuthorized()); 
	}
	
	function redirectToPublicProfile(req, res){
		if(req.meta_user && req.meta_user.authenticated())
			res.redirect('/users/' + req.meta_user.id())
		else
			res.redirect('/');
	}	
	
	function profilePage(req, res, user){
		if(!user) return res.send("", 404);
		
		res.render('profiles/profile', {
			locals: app.standard_page_vars(req, {
				app:app,
				profileUser: user,
				jquery: true,
				page_js: 'profile'
			})
		});
	}
	
	function ownProfilePage(req, res){
		if(!req.user) return res.send("", 404);
		
		res.render('profiles/own_profile', {
			locals: app.standard_page_vars(req, {
				app:app,
				profileUser: req.user,
				jquery: true,
				page_js: 'profile'
			})
		});
	}
}

module.exports = ProfileController;
