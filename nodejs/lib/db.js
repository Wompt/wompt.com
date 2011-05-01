var wompt        = require('./includes'),
    mongoose     = wompt.dependencies.mongoose;

var db_name = 'mongodb://' + wompt.env.db_host + '/' + wompt.env.db_name;

mongoose.connect(db_name, function(err){
	if(err){
		console.log("ERROR: Can't Connect to Database: " + db_name);
		throw err;
		process.exit();
	}
});

module.exports = mongoose;
