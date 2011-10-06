var wompt = require('./includes'),
root = wompt.env.root,
pub = wompt.env.public_dir,
customHandlers = require('./asset_handlers.js'),
assetManager = require('connect-assetmanager'),
assetHandler = require('connect-assetmanager-handlers'),
util = require('./util'),
staticFileUrlPrefix = '/s/',

cssPreManipulators = {
	// Regexp to match user-agents including MSIE.
	'MSIE': [
		assetHandler.fixVendorPrefixes
		, assetHandler.fixGradients
		, customHandlers.replaceRgbaWithRgb
		// Custom version of assetHandler.stripDataUrlsPrefix that takes into account
		// The static files url prefix
		, function (file, path, index, isLast, callback) {
			callback(file.replace(/data-url\(\//ig,'url(/s/'));
		}
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
			, '/public/external/json2.js'
			, '/public/js/util.js'			
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
// TODO Finish Ops, update it for the new socket.IO and re-enable this
//			, '/public/js/ops.js'
			, '/public/js/ui.connection_status.js'
			, '/public/js/ui.layout.js'
			, '/public/js/ui.fb.share.js'
			, '/public/js/ui.twitter.js'
			, '/public/js/sign_in.js'
			, '/public/js/links_in_new_tab.js'
			, '/public/js/landing.js'
			, '/public/js/header_tools.js'
			, '/public/js/rate_limit.js'
		]
	}), 'profile_js': mc(defaultOptions,{
		'route': /\/js\/profile_[\d]+.js/
		, 'path': root
		, 'dataType': 'javascript'
		, 'files': [
			'/public/external/bootstrap.js'
			, '/public/external/events.js'			
			, '/public/js/ui.js'
			, '/public/js/sign_in.js'
			, '/public/js/ui.layout.js'
			, '/public/js/profile.js'
		]
	}), 'search_js': mc(defaultOptions,{
		'route': /\/js\/search_[\d]+.js/
		, 'path': root
		, 'dataType': 'javascript'
		, 'files': [
			'/public/external/bootstrap.js'
			, '/public/external/events.js'			
			, '/public/js/ui.js'
			, '/public/js/sign_in.js'
			, '/public/js/search.js'
		]
	}),
	
	'accounts_js': mc(defaultOptions,{
		'route': /\/js\/accounts_[\d]+.js/
		, 'path': root
		, 'dataType': 'javascript'
		, 'files': [
			'/public/external/bootstrap.js'
			, '/public/external/events.js'			
			, '/public/js/ui.js'
			, '/public/js/header_tools.js'
			, '/public/js/account.js'
		]
	}),
	
	'analytics_js': mc(defaultOptions,{
		'route': /\/js\/analytics_[\d]+.js/
		, 'path': root
		, 'dataType': 'javascript'
		, 'files': [
			'/public/js/util.js',
			'/public/js/analytics.js'
		]
	}),
	
	'socket_io_js': mc(defaultOptions,{
		'route': /\/js\/socket_io_[\d]+.js/
		, 'path': root
		, 'dataType': 'javascript'
		, 'files': [
			'/vendor/Socket.IO/dist/socket.io.js'
		]
	}),
/* ======  CSS Files  ======= */
	
	'all_css': mc(defaultOptions,{
		'route': /\/css\/all_[0-9]+\.css/
		, 'path': pub + '/css/'
		, 'dataType': 'css'
		, 'files': [
			  'reset.css'
			, 'base.css'
			, 'black_fade.css'
			, 'buttons.css'
			, 'embed_form.css'
			, 'landing.css'
			, 'header.css'
			, 'footer.css'
			, 'chat.css'
			, 'user_list.css'
			, 'support_pages.css'
			, 'share_links.css'
			, 'external/autocomplete.css'
			, 'external/grid_978.css'
			, 'icons.css'
			, 'embed.css'
			, 'search.css'
			, 'errors.css'
			, 'accounts.css'
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
	})
};

var exporting = {
	middleware: assetManager(assetManagerGroups),
	helpers:{
		assetGroupTag: function(name, user){
			var ts = exporting.middleware.cacheTimestamps[name+'_js'];
			if(user && user.is_admin()){
				var group = assetManagerGroups[name+'_js'];
				return group.files.map(function(file){
					return exporting.helpers.scriptTag(staticFileUrlPrefix + file.replace(/^\/[^\/]+\//, '') + '?' + ts); // strip the first directory  /public/blah -> /blah
				}).join('');
			}else
				return exporting.helpers.scriptTag("/js/" + name + "_" + ts + ".js");
		},
		
		scriptTag: function(file){
			return "<script src='" + file + "' type='text/javascript'></script>"
		}
	}
};

module.exports = exporting;
