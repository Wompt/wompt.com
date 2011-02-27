exports.replaceRgbaWithRgb = function (file, path, index, isLast, callback) {
	callback(file.replace(/rgba\(([\s\d,]+),[\s\d\.]+\)/ig,
		function(match, group){
			return "rgb("+group+")";
		}
	));
}