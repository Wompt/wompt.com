var path = require('path');

// strip the last dir...  essentially the same as __dirname/..
var root = path.dirname(__dirname); //.replace(/\/[^\/]+\/?$/,'');

module.exports = {
	  port: 8001
	, public_dir: root + '/public'
	, db_name: 'wompt_dev'
	, root: root
	, app_host:  '127.0.0.1'
	, db_host:   '127.0.0.1'
	, auth_host: '127.0.0.1'
	
	, minify_assets: false
	
	, constants: {
		messages: {
				max_length: 256 * 16,
				max_shown: 500
		}
	}
	
	, hoptoad: {
		reportErrors: false
	}
	
	, logs: {
		root: root
	}
	
	, redirectWww: false
	, redirectWwwToPort: 16880
}
