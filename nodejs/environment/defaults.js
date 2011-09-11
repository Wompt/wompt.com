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
		},
		ops:{
			kick_time: 30 // seconds
		}
	}
	
	, hoptoad: {
		reportErrors: false
	}
	
	,errors:{
		showDebugData: false
	}	
	
	, logs: {
		root: root,
		monitor:{
			interval: 1*60*1000
		},
		channels: {
			root: root + '/logs/channels'
		}
	}
	
	/* Ops */
	, ops: {
		// how long a user should keep ops after they leave a room
		keep_when_absent_for: 5*60*1000
	}
	
	/* google analytics */
	, ga: {
		use: true
	}
	
	, socketio: {
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
			,{name: 'Twitter',   code: 'twitter'}
		]
	}
	
	, flags:{
		localjQuery:false,
		noFacebook:false
	}
	
	, redirectWww: false
	, redirectWwwToPort: 16867
}
