var defaults = require('./defaults'),
    path = require('path'),
		shared = path.normalize(defaults.root + '/../shared');

module.exports = {
	  port: 16999
	, db_name: 'wompt_prod'
	, minify_assets: true
	, perform_caching: true
	, hoptoad: {
		  apiKey: '2d12a5a4e55714b1d7a3fbae31c5e0ae'
		, reportErrors: true
	}
	, logs: {
		root: path.normalize(shared + '/log')
		,monitor:{
			interval: 1*60*1000
		}
		,channels:{
			root: path.normalize(shared + '/log/channels')
		}
	}	
	, redirectWww	: true
}
