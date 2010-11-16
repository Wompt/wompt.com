// strip the last dir...  essentially the same as __dirname/..
var root = __dirname.replace(/\/[^\/]+\/?$/,'');

module.exports = {
	  port: 8001
	, public_dir: root + '/public'
	, db_name: 'wompt_dev'
}
