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
	var renderError, status;
	
	if(app.config.errors.showDebugData){
		renderError = wompt.dependencies.express.errorHandler({
			showStack: true,
			showMessage: true,
		});
	} else {
		renderError = function(err, req, res, next){
			res.render('errors/generic',{
				status: status,
				layout: 'layouts/plain',
				locals: app.standard_page_vars(req, {
					err: err,
					hide_top_query: true,
					page_name:'error'
				})
			});
		}
	}
	
	return function PageRenderer(err, req, res, next){
		
		if(err instanceof wompt.errors.NotFound){
			// not important, just a 404
			status = 404
		}else if(err instanceof wompt.errors.NotAuthorized){
			status = 401
		}else{
			status = 500
		}
		// renderError doesn't actually use 'this'
		renderError.apply(this, arguments);
		
		// pass on the error, it should be reported		
		if(status >= 500)
			next(err);
	}
}

module.exports = {
	NotFound: NotFound,
	NotAuthorized: NotAuthorized,
	createPageRenderer: createPageRenderer
}
