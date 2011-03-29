var wompt = require('./includes');
var root = wompt.env.root;
var pub = wompt.env.public_dir;
var customHandlers = require('./asset_handlers.js');


var assetManager = require('connect-assetmanager');
var assetHandler = require('connect-assetmanager-handlers');

var assetManagerGroups = {
	'channel_js': {
		'route': /\/js\/channel_[\d]+.js/
		, 'path': root
		, 'dataType': 'javascript'
		, 'debug': !wompt.env.minify_assets
		, 'stale': wompt.env.perform_caching		
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
			, '/public/js/ui.messages_scroller.js'
			, '/public/js/ui.notifications.js'
			, '/public/js/color_dispensor.js'
			, '/public/js/message_list.js'
			, '/public/js/user_list.js'
			, '/public/js/util.js'
			, '/public/js/ui.connection_status.js'
			, '/public/js/ui.layout.js'
		]
	}, 'all_css': {
		'route': /\/css\/all_[0-9]+\.css/
		, 'path': pub + '/css/'
		, 'dataType': 'css'
		, 'debug': !wompt.env.minify_assets
		, 'stale': wompt.env.perform_caching
		, 'files': [
			  'reset.css'
			, 'base.css'
			, 'landing.css'
			, 'header.css'
			, 'footer.css'
			, 'chat.css'
			, 'user_list.css'
			, 'support_pages.css'
		]
		, 'preManipulate': {
			// Regexp to match user-agents including MSIE.
			'MSIE': [
				assetHandler.yuiCssOptimize
				, assetHandler.fixVendorPrefixes
				, assetHandler.fixGradients
				, customHandlers.replaceRgbaWithRgb
				, assetHandler.stripDataUrlsPrefix
			],
			// Matches all (regex start line)
			'^': [
				assetHandler.yuiCssOptimize
				, assetHandler.fixVendorPrefixes
				, assetHandler.fixGradients
				, assetHandler.replaceImageRefToBase64(pub)
			]
		}
	}
};

module.exports = {
	middleware: assetManager(assetManagerGroups)
}
