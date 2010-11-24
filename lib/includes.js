var env = exports.env = require("../environment");
require.paths.unshift(env.root + '/vendor/mongoose');


exports.logger    = require("./logger");
exports.App       = require("./app");
exports.Channel   = require("./channel").Channel;
exports.ClientPool  = require("./client_pool").ClientPool;
exports.MessageList = require("./message_list").MessageList;
exports.Auth        = require("./authentication").Auth;
exports.mongoose    = require('mongoose').Mongoose;
exports.db          = require('./db').db;
exports.User        = require("./user");
exports.UserSessions= require("./user_sessions");
exports.ChannelManager = require('./channel_manager');
exports.Helpers     = {
	Assets:             require('./helpers/assets')
}