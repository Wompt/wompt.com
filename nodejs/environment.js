var default_env = require("./environment/defaults");

var environment = process.env.NODE_ENV || 'development';
var specified_env = require("./environment/" + environment);

specified_env = require('./lib/util').mergeCopy(default_env, specified_env);

console.log("Using environment: " + environment);
specified_env.name = environment;

module.exports = specified_env;
