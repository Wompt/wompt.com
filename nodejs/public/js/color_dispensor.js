UI.once('init', function(){
	var colors = [
		'7D2252'
		, '800517'
		, '7E3817'
		, 'C36241'
		, 'AF7817'
		, 'A0C544'
		, '827839'
		, '348017'
		, '254117'
		, '736AFF'
		, '717D7D'
		, '566D7E'
		, '461B7E'
		, 'D16587'
		, 'B048B5'
		, '8D38C9'
		, '153E7E'
		, '151B8D'
		, '25383C'
		, 'F62817'
		, 'F87431'
		, 'F76541'
	];
		
	function colorDispensor(colors){
		var map = {}
		  , overrides = {}
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
				return "#" + (overrides[str] || colors[map[str]]);
			},
			override: function(str, color){
				overrides[str] = color;
			}
		}
	}

	var colorDispensors = {};	
	function getDispensor(context){
		if(!colorDispensors[context]){
			var randomized = colors.sort(function() {return 0.5 - Math.random()});
			colorDispensors[context] = new colorDispensor(randomized);
		}
		return colorDispensors[context];
	}
	
	// User's own name is always black
	if(Me && Me.id)
		getDispensor('user').override(Me.id, '000000');
	

	this.Colors = {
		getDispensor: getDispensor,
		
		forUser: function(str){
			return getDispensor('user').colorFor(str);
		}
	};
});

