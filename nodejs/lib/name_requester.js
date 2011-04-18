var wompt = require('./includes'),
jade = wompt.dependencies.jade;

function NameRequester(client){
	this.client = client;
	//client.on('message', this.onMessage.bind(this));
	this.checkUser();
}

NameRequester.prototype = {
	onMessage:function(data){
		
	},
	
	checkUser:function(){
		if(this.client.user){
			this.client.send({action:'popup', options:{html: "Hey!"}});
		}
	}
}

NameRequester.checkUser = function(client){
	if(client.user){
		jade.renderFile('views/popups/request_name.jade', { cache: false }, function(err, html){
			if(err) console.dir(err);
			if(html) console.dir(html);
			client.send({action:'popup', options:{html:html}});
		});
	}
}

module.exports = NameRequester;