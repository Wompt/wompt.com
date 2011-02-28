var default_env = require("./environment/defaults");

var environment = process.env.NODE_ENV || 'development';
var specified_env = require("./environment/" + environment);
var final_env = default_env;

//copy specified options onto default options
for(var key in specified_env){
	final_env[key] = specified_env[key];
};

console.log("Using environment: " + environment);
final_env.name = environment;

module.exports = final_env;
