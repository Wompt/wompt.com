var e = module.exports;
var env = e.env = require("../environment");
require.paths.unshift(env.root + '/vendor');

e.dependencies   = require("wompt_dependencies");

e.logger         = require("./logger");
e.Channel        = require("./channel").Channel;
e.ClientPool     = require("./client_pool").ClientPool;
e.MessageList    = require("./message_list").MessageList;
e.Auth           = require("./authentication").Auth;
e.mongoose       = require('mongoose/mongoose').Mongoose;
e.db             = require('./db').db;
e.MetaUser       = require("./meta_user");
e.MetaUserManager= require("./meta_user_manager");
e.User           = require("./user");
e.ClientConnectors=require("./client_connectors");
e.ChannelManager = require('./channel_manager');
e.Expirer        = require('./expirer');
e.socketIO       = require("Socket.IO-node/index");
e.Helpers        = {
	Assets:          require('./helpers/assets')
};
e.App            = require("./app");
e.middleware     = {
};
e.monitors       = {
	 PopularChannels: require('./monitors/popular_channels.js')
	,TwitterTopics:   require('./monitors/twitter_topics.js')
	,AppState:        require('./monitors/app_state_monitor.js')
}
