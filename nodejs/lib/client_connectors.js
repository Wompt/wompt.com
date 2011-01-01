var wompt = require('./includes');

function ClientConnectors(){
	
	var connectors = this.connectors = {};
	var expirer = new wompt.Expirer(connectors, {
		expire_after_ms: 10 * 1000
	});
}

ClientConnectors.prototype = {
	add: function(connector){
		connector.id = wompt.Auth.generate_token();
		connector.touched = new Date();
		this.connectors[connector.id] = connector;
		return connector;
	},
	
	get: function(id){
		return this.connectors[id];
	}
}

module.exports = ClientConnectors;
