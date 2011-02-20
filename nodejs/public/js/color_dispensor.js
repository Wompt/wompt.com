UI.once('init', function(){
	var colors = [
			  'CC3300'
			, '0033CC'
			, '33CC00'
	];
		
	function colorDispensor(colors){
		var map = {}
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
	}

	var colorDispensors = {};	
	function getDispensor(context){
		if(!colorDispensors[context]){
			colorDispensors[context] = new colorDispensor(colors);
		}
		return colorDispensors[context];
	}
	

	this.Colors = {
		getDispensor: getDispensor,
		
		forUser: function(str){
			return getDispensor('user').colorFor(str);
		}
	};
});

