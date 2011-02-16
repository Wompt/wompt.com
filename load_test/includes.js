var e = module.exports;
var env = e.env = require("../nodejs/environment.js");
require.paths.unshift(env.root + '/vendor');

e.socketIO       = require("Socket.IO-node/index");