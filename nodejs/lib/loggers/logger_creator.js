var wompt = require('../includes');

function LoggerCreator(channelManager, subdirectory){
	if(!wompt.env.logs.channels.disabled){
		channelManager.on('new_channel', function(channel){
				new wompt.loggers.ChannelLogger(channel, subdirectory);
		});
	}
}

module.exports = LoggerCreator;