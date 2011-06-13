var wompt = require("./includes"),
util = require('util');

function BaseError(msg){
	this.message = msg || this.name;
	this.captureStack();
}

BaseError.prototype.captureStack = function(){
	if(wompt.env.errors.showDebugData)
		Error.captureStackTrace(this, this.constructor);
}


function NotFound(msg){
	NotFound.super_.apply(this, arguments);
}
util.inherits(NotFound, BaseError)
NotFound.prototype.name = 'Not Found';


function NotAuthorized(msg){
	NotAuthorized.super_.apply(this, arguments);
}
util.inherits(NotAuthorized, BaseError)
NotAuthorized.prototype.name = 'Not Authorized';



function createPageRenderer(app){
	var renderError;
	
	if(app.config.errors.showDebugData){
		renderError = wompt.dependencies.express.errorHandler({
			showStack: true,
			showMessage: true,
		});
	} else {
		renderError = function(err, req, res, next){
			res.render('errors/generic',{
				locals: app.standard_page_vars(req, {
					hide_top_query: true,
					page_name:'error'
				})
			});
		}
	}
	
	return function PageRenderer(err, req, res, next){
		
		// renderError doesn't actually use 'this'
		renderError.apply(this, arguments);
		
		if(err instanceof wompt.errors.NotFound){
			// not important, just a 404
		}else{
			// pass on the error, it should be reported
			next(err);
		}
	}
}

module.exports = {
	NotFound: NotFound,
	createPageRenderer: createPageRenderer
}
