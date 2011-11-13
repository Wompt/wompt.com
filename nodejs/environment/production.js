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
		,channels:{
			root: path.normalize(shared + '/log/channels')
		}
	}
	
	, socketio: {
		serverOptions: {
			// Port to serve the flash policy doc from, iptables maps port 843 -> 16843
			'flash policy port': 16843,
			// level = warn, leave out: info and debug
			'log level': 1
		}
	}
	, redirectWww	: true
}
