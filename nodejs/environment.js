var default_env = require("./environment/defaults");

var environment = process.env.NODE_ENV || 'development';
var specified_env = require("./environment/" + environment);

require('./lib/util').mergeDeep(specified_env, default_env);

console.log("Using environment: " + environment);
specified_env.name = environment;

module.exports = specified_env;
