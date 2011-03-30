var wompt = require('./includes'),
root = wompt.env.root,
pub = wompt.env.public_dir,
customHandlers = require('./asset_handlers.js'),
assetManager = require('connect-assetmanager'),
assetHandler = require('connect-assetmanager-handlers'),
util = require('./util'),

cssPreManipulators = {
	// Regexp to match user-agents including MSIE.
	'MSIE': [
		assetHandler.fixVendorPrefixes
		, assetHandler.fixGradients
		, customHandlers.replaceRgbaWithRgb
		, assetHandler.stripDataUrlsPrefix
		, assetHandler.yuiCssOptimize
	],
	// Matches all (regex start line)
	'^': [
		assetHandler.fixVendorPrefixes
		, assetHandler.fixGradients
		, assetHandler.replaceImageRefToBase64(pub)
		, assetHandler.yuiCssOptimize				
	]
},

defaultOptions = 	{
	'debug': !wompt.env.minify_assets
	, 'stale': wompt.env.perform_caching
},
mc = util.mergeCopy
;

var assetManagerGroups = {
	'channel_js': mc(defaultOptions,{
		'route': /\/js\/channel_[\d]+.js/
		, 'path': root
		, 'dataType': 'javascript'
		, 'files': [
			'/public/external/bootstrap.js'
			, '/public/external/events.js'
			, '/vendor/Socket.IO/socket.io.js'
			, '/public/external/json2.js'
			, '/public/js/main.js'
			, '/public/js/io.js'
			, '/public/js/ui.js'
			, '/public/js/ui.messages.js'
			, '/public/js/ui.input.js'
			, '/public/js/ui.input.tab_completion.js'
			, '/public/js/ui.messages_scroller.js'
			, '/public/js/ui.notifications.js'
			, '/public/js/color_dispensor.js'
			, '/public/js/message_list.js'
			, '/public/js/user_list.js'
			, '/public/js/util.js'
			, '/public/js/ui.connection_status.js'
			, '/public/js/ui.layout.js'
			, '/public/js/ui.lightbox.js'			
			, '/public/js/ui.fb.share.js'
			, '/public/js/sign_in.js'
			, '/public/js/links_in_new_tab.js'
		]
	}),	'landing_js': mc(defaultOptions,{
		'route': /\/js\/landing_[\d]+.js/
		, 'path': root
		, 'dataType': 'javascript'
		, 'files': [
			'/public/external/bootstrap.js'
			, '/public/external/events.js'
			, '/public/js/sign_in.js'
			, '/public/js/ui.js'
			, '/public/js/ui.layout.js'
			, '/public/js/landing.js'
		]
	}), 'profile_js': mc(defaultOptions,{
		'route': /\/js\/profile_[\d]+.js/
		, 'path': root
		, 'dataType': 'javascript'
		, 'files': [
			'/public/external/bootstrap.js'
			, '/public/js/sign_in.js'
		]
	}), 'all_css': mc(defaultOptions,{
		'route': /\/css\/all_[0-9]+\.css/
		, 'path': pub + '/css/'
		, 'dataType': 'css'
		, 'files': [
			  'reset.css'
			, 'base.css'
			, 'black_fade.css'
			, 'landing.css'
			, 'header.css'
			, 'footer.css'
			, 'chat.css'
			, 'user_list.css'
			, 'support_pages.css'
			, 'share_links.css'
			, 'lightbox.css'
		]
		, 'preManipulate': cssPreManipulators
	}), 'profile_css': mc(defaultOptions,{
		'route': /\/css\/profile_[0-9]+\.css/
		, 'path': pub + '/css/'
		, 'dataType': 'css'
		, 'files': [
			'profile.css'
		]
		, 'preManipulate': cssPreManipulators
	}), 'embedd_css': mc(defaultOptions,{
		'route': /\/css\/embedd_[0-9]+\.css/
		, 'path': pub + '/css/'
		, 'dataType': 'css'
		, 'files': [
			'embedd.css'
		]
		, 'preManipulate': cssPreManipulators
	}),	
	'admin_socket_io': { // to support multiple
		'route': /\/Socket.IO\/socket\.io\.js/
		, 'path': root
		, 'dataType': 'javascript'
		, 'debug': true
		, 'stale': wompt.env.perform_caching		
		, 'files': [
			, '/vendor/Socket.IO/socket.io.js'
		]
	}
};

var exporting = {
	middleware: assetManager(assetManagerGroups),
	helpers:{
		assetGroupTag: function(name, user){
			if(user && user.is_admin()){
				var group = assetManagerGroups[name+'_js'];
				return group.files.map(function(file){
					return exporting.helpers.scriptTag(file.replace(/^\/[^\/]+\//, '/')); // strip the first directory  /public/blah -> /blah
				}).join('');
			}else
				return exporting.helpers.scriptTag("/js/" + name + "_" + exporting.middleware.cacheTimestamps[name+'_js'] + ".js");
		},
		
		scriptTag: function(file){
			return "<script src='" + file + "' type='text/javascript'></script>"
		}
	}
};

module.exports = exporting;
