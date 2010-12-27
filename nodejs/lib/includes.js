var env = exports.env = require("../environment");
require.paths.unshift(env.root + '/vendor');


exports.logger    = require("./logger");
exports.Channel   = require("./channel").Channel;
exports.ClientPool  = require("./client_pool").ClientPool;
exports.MessageList = require("./message_list").MessageList;
exports.Auth        = require("./authentication").Auth;
exports.mongoose    = require('mongoose/mongoose').Mongoose;
exports.db          = require('./db').db;
exports.User        = require("./user");
exports.UserSessions= require("./user_sessions");
exports.ChannelManager = require('./channel_manager');
exports.socketIO    = require("Socket.IO-node/index");
exports.Helpers     = {
	Assets:             require('./helpers/assets')
}
exports.App       = require("./app");