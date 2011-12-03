module.exports = {
	express: require('express'),
	mongoose: require('mongoose'),
	jade: require('jade'),
	httpProxy: require('http-proxy'),
	step: require('step'),
	async: require('async'),
	lingo: require('lingo'),
	socketio: require('socket.io'),
	expressResource: require("./vendor/express-resource"),
	connectAssetManager: require('./vendor/connect-assetmanager')
}
