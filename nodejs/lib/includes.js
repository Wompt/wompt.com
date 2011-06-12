var e = module.exports;
var env = e.env = require("../environment");
require.paths.unshift(env.root + '/vendor');

e.dependencies   = require("wompt_dependencies");
e.util           = require('./util');

e.logger         = require("./logger");
e.Channel        = require("./channel").Channel;
e.ClientPool     = require("./client_pool").ClientPool;
e.MessageList    = require("./message_list").MessageList;
e.Auth           = require("./authentication").Auth;
e.mongoose       = require('./db');
e.MetaUser       = require("./meta_user");
e.MetaUserManager= require("./meta_user_manager");
e.Account        = require("./models/account");
e.AccountManager = require("./account_manager");
e.User           = require("./models/user");
e.Room           = require("./models/room");
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
	,AppState:        require('./monitors/app_state_monitor.js')
}
e.loggers        = {
	 ChannelLogger:   require('./loggers/channel_logger.js')
	,AppStateLogger:  require('./loggers/app_state_logger.js')
	,LoggerCreator:   require('./loggers/logger_creator.js')
}
e.controllers    = {
	Accounts:         require('./controllers/accounts.js')
}
e.errors         = require('./errors');
e.fail           = function(msg){throw msg};
