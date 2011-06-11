var wompt = require("../includes"),
    mongoose = wompt.mongoose;

var Account = new mongoose.Schema({
	'display_name'    : String
	,'name'           : String
});

// number defines index sort order (1=asc)
Account.index({name: 1});

// Model name, Schema, collection name
mongoose.model('Account', Account, 'accounts');
module.exports = mongoose.model('Account');
