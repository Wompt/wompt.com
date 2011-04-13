var path = require('path');

// strip the last dir...  essentially the same as __dirname/..
var root = path.dirname(__dirname); //.replace(/\/[^\/]+\/?$/,''),
deploy_root = path.normalize(root + '/..');

module.exports = {
	  port: 8001
	, public_dir: root + '/public'
	, db_name: 'wompt_dev'
	, root: root
	, deploy_root: deploy_root
	, app_host:  '127.0.0.1'
	, db_host:   '127.0.0.1'
	, auth_host: '127.0.0.1'
	
	, minify_assets: false
	
	, constants: {
		messages: {
				max_length: 256 * 1,
				max_shown: 500
		}
	}
	
	, hoptoad: {
		reportErrors: false
	}
	
	, logs: {
		root: root,
		channels: {
			root: root + '/logs/channels'
		}
	}
	
	, facebook: {
		showLike: true
	}
	
	, redirectWww: false
	, redirectWwwToPort: 16867
}
