var wompt = require("./includes");

function NotFound(msg){
	this.message = msg;
}

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
