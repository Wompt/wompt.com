var e = module.exports;
var env = e.env = require("../environment");
require.paths.unshift(env.root + '/vendor');

e.logger         = require("./logger");
e.Channel        = require("./channel").Channel;
e.ClientPool     = require("./client_pool").ClientPool;
e.MessageList    = require("./message_list").MessageList;
e.Auth           = require("./authentication").Auth;
e.mongoose       = require('mongoose/mongoose').Mongoose;
e.db             = require('./db').db;
e.User           = require("./user").User;
e.MetaUser       = require("./user").MetaUser;
e.UserSessions   = require("./user_sessions");
e.ChannelManager = require('./channel_manager');
e.Expirer        = require('./expirer');
e.socketIO       = require("Socket.IO-node/index");
e.Helpers        = {
	Assets:          require('./helpers/assets')
};
e.App            = require("./app");
e.middleware     = {
	staticProvider:  require('./middleware/staticProvider')
};
