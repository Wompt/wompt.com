var env          = require("../environment"),
    mongoose     = require('mongoose'),
    db           = new (require('events').EventEmitter)();

var db_name = 'mongodb://' + env.db_host + '/' + env.db_name;

mongoose.connect(db_name, function(err){
	if(err){
		console.log("ERROR: Can't Connect to Database: " + db_name);
		throw err;
		process.exit();
	}
});

module.exports = mongoose;
