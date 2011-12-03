var e = module.exports;
var env = e.env = require("../environment");

e.dependencies   = require("../dependencies");
e.util           = require('./util');

e.logger         = require("./logger");
e.Channel        = require("./channel").Channel;
e.ClientPool     = require("./client_pool").ClientPool;
e.ClientPoolStats= require("./client_pool").ClientPoolStats;
e.MessageList    = require("./message_list").MessageList;
e.Auth           = require("./authentication").Auth;
e.ParameterAuthentication = require("./parameter_authentication");
e.mongoose       = require('./db');
e.MetaUser       = require("./meta_user");
e.MetaUserManager= require("./meta_user_manager");
e.roles          = require("./roles");
e.Account        = require("./models/account");
e.AccountManager = require("./account_manager");
e.User           = require("./models/user");
e.ClientConnectors=require("./client_connectors");
e.ChannelManager = require('./channel_manager');
e.Expirer        = require('./expirer');
e.SocketIO       = e.dependencies.socketio;
e.Helpers        = {
	Assets:          require('./helpers/assets')
};
e.App            = require("./app");
e.middleware     = {
};
// TODO: The above model references should be phased out in preference of these
e.models         = {
	 Account:         require("./models/account")
	,User:            require("./models/user")
	,Room:            require("./models/room")
	,AccountStats:    require("./models/account_stats")
}
e.monitors       = {
	 PopularChannels: require('./monitors/popular_channels.js')
	,AppState:        require('./monitors/app_state_monitor.js')
	,NamespaceStats:  require('./monitors/namespace_stats.js')
}
e.loggers        = {
	 ChannelLogger:   require('./loggers/channel_logger.js')
	,AppStateLogger:  require('./loggers/app_state_logger.js')
	,LoggerCreator:   require('./loggers/logger_creator.js')
}
e.controllers    = {
	 Accounts:        require('./controllers/accounts.js')
	,Admin:           require('./controllers/admin.js')
	,Namespace:       require('./controllers/namespace.js')
	,Search:          require('./controllers/search.js')
	,Profile:         require('./controllers/profile.js')
}
e.errors         = require('./errors');
e.fail           = function(msg){throw msg};
