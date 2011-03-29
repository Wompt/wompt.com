module.exports = function(opt){
	var stripNewlines = opt && opt.stripNewlines;
	
	return {
		compile: function(str, view_options){
			if(stripNewlines) str = str.replace(/[\n\r]+/, ' ');
			return function(locals){
				return str;
			}
		}
	}
}