var default_env = require("./environment/defaults"),
util = require('./lib/util');

var environment = process.env.NODE_ENV || 'development';
var specified_env = require("./environment/" + environment);

specified_env = util.mergeCopy(default_env, specified_env);

function precomputeConstantsJSON(){
	// Pre-compute this so it can be spit out quickly in templates
	specified_env.constantsJSON = JSON.stringify(specified_env.constants);
}
precomputeConstantsJSON();

console.log("Using environment: " + environment);

specified_env.name = environment;

// REVISION is a file containing the deployed commit ID created by Capistrno
util.fs.readFile(specified_env.deploy_root + '/REVISION', function(text, exists){
	var version = text || Math.random().toString();
	var hash = util.md5(version);
	util.mergeDeep(specified_env, {constants: {version_hash: hash}});
	precomputeConstantsJSON();
});


module.exports = specified_env;
