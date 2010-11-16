var default_env = require("./environment/defaults");

var environment = process.argv[2] || 'development';
var specified_env = require("./environment/" + environment);
var final_env = default_env;

//copy specified options onto default options
for(var key in specified_env){
	final_env[key] = specified_env[key];
};

module.exports = final_env;
