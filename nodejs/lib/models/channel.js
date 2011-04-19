var wompt = require("../includes"),
    db = wompt.db;

wompt.mongoose.model('Channel',{

	collection : 'channels',

	properties: [
		//simple attributes
		 'name'
		,'title'
		,'link'
	],
	
	indexes : [
		 'name'
	]
});

module.exports = db.model('Channel');

