var wompt = require('./includes'),
jade = wompt.dependencies.jade;

function NameRequester(client){
	this.client = client;
	this.client.once('message', this.onMessage.bind(this));
	this.promptUser();
}

NameRequester.prototype = {
	onMessage:function(data){
		if(data.action == 'popup/response'){
			this.client.user.setAndSave({name:data.name.toString()});
		}
	},

	promptUser: function(){
		var client = this.client;
		jade.renderFile('views/popups/request_name.jade', { cache: false }, function(err, html){
			client.send({action:'popup', options:{cancellable: false, html:html}});
		});
	}
}

NameRequester.checkUser = function(client){
	var meta_user    = client.user,
	should_have_name = meta_user && meta_user.visible && meta_user.authenticated(),
	name             = should_have_name && meta_user.name();
	
	if(should_have_name && !is_valid_name(name)) {
		return new NameRequester(client);
	}
	
	function is_valid_name(name){
		return name && name.length > 1;
	}
}

module.exports = NameRequester;
