var wompt = require("./includes");

function NotFound(msg){
	this.message = msg;
}

function createPageRenderer(app){
	return function PageRenderer(err, req, res, next){
		res.render('errors/generic',{
			locals: app.standard_page_vars(req, {
				hide_top_query: true,
				page_name:'error'
			})
		});
		
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
