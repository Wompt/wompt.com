var wompt = require('./includes');
var root = wompt.env.root;
var pub = wompt.env.public_dir;


var assetManager = require('connect-assetmanager');
var assetHandler = require('connect-assetmanager-handlers');

var assetManagerGroups = {
	'landing_js': {
		'route': /\/js\/landing_[\d]+.js/
		, 'path': pub
		, 'dataType': 'javascript'
		, 'files': [
			'/external/events.js'
		]
	},		
	'channel_js': {
		'route': /\/js\/channel_[\d]+.js/
		, 'path': root
		, 'dataType': 'javascript'
		, 'debug': !wompt.env.minify_assets
		, 'files': [
			'/public/external/events.js'
			, '/vendor/Socket.IO/socket.io.js'
			, '/public/external/json2.js'
			, '/public/js/io.js'
			, '/public/js/ui.js'
			, '/public/js/message_list.js'
			, '/public/js/user_list.js'
			, '/public/js/main.js'
		]
	}, 'all_css': {
		'route': /\/css\/all_[0-9]+\.css/
		, 'path': pub + '/css/'
		, 'dataType': 'css'
		, 'debug': !wompt.env.minify_assets
		, 'files': [
			  'reset.css'
			, 'base.css'
			, 'landing.css'
			, 'twitter.css'
		]
		, 'preManipulate': {
			// Regexp to match user-agents including MSIE.
			'MSIE': [
				assetHandler.yuiCssOptimize
				, assetHandler.fixVendorPrefixes
				, assetHandler.fixGradients
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
