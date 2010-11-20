var fs = require('fs');

var AssetStats = function(public_dir){
	var assets = {};
	
	this.path = function(filename){
		return filename + '?' + this.asset_info(filename).ts;
	}
	
	this.asset_info = function(filename){
		var asset = assets[filename];
		if(asset) return asset;
		else return assets[filename] = get_info(filename);
	}
	
	function get_info(filename){
		var stat = fs.statSync(public_dir + filename);
		stat.ts = stat.mtime.getTime();
		return stat;
	}
};

module.exports = AssetStats;