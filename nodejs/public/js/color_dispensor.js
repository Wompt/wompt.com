var colorDispensor = function(){
	var colors = [
			  'CC3300'
			, '0033CC'
			, '33CC00'
			]
	  , map = {}
	  , index = 0;
	
	return {
		/* Returns a color in form of '#xxxxxx' where x is a hex digit for the
		provided string.  The color returned for each string is memoed and won't
		change*/
		colorFor: function(str){
			if(map[str] == undefined){
				map[str] = index;
				index = (index + 1) % colors.length;
			}
			return "#" + colors[map[str]];
		}
	}
};
