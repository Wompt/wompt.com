//var wompt = require('./includes.js');
var config = {
	host: 'localhost:8001'
};

var SERVER, WebSocket, client, ioutils, response, sys;

sys = require('sys');
ioutils = require('../nodejs/vendor/Socket.IO-node/lib/socket.io/utils.js');

WebSocket = require('websocket-client').WebSocket;
WebSocket.prototype.send_socketio = function(msg){
	if (Object.prototype.toString.call(msg) == '[object Object]'){
		msg = '~j~' + JSON.stringify(msg);
	} else {
		msg = String(msg);
	}		
	
	return client.send(ioutils.encode(msg));
}

SERVER = config.host || 'localhost:80';

if (SERVER.search(':') === -1) {
	SERVER += ':80';
}


(function() {
	
  client = new WebSocket("ws://" + (SERVER) + "/socket.io/websocket");
	
  client.onmessage = function(m) {
    var _result, currMsg, heartbeat;
    m = ioutils.decode(m.data);
    heartbeat = '~h~';
    _result = [];
    while (currMsg = m.pop()) {
      _result.push((function() {
        console.log("Got message: " + (sys.inspect(currMsg)));
        return currMsg.substr(0, 3) === heartbeat ? client.send_socketio(heartbeat + currMsg.substr(3)) : null;
      })());
    }
    return _result;
  };
	
	var channel = 'room1',
	connector_id = null;
	
  setTimeout(function() {
    client.send_socketio({channel: channel, action: 'join', connector_id: null});
  }, 0);
	
}).call(this);