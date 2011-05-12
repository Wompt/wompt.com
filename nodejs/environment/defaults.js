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
				max_length: 1024 * 1,
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
	
	/* google analytics */
	, ga: {
		use: true
	}
	
	, socketIO: {
		serverOptions: {
		}
	}
	
	/* Authentication */
	, cookies : {
		one_time: 'wompt_auth_one_time_token',
		token:    '_wompt_auth'
	}
	
	, auth: {
		providers:[
			 {name: 'facebook',  code: 'facebook'}
			,{name: 'Github',    code: 'github'}
			,{name: 'Google',    code: 'google'}
		]
	}
	
	, redirectWww: false
	, redirectWwwToPort: 16867
}
