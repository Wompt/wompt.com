var wompt = require("../includes"),
mongoose = wompt.mongoose,
ObjectId = mongoose.Schema.ObjectId;

var AccountStats = new mongoose.Schema({
	account_id         : {type: ObjectId, index: true}
	,frequency         : String
	,t                 : Date
	,peak_connections  : Integer
	,connections       : Integer
});

// Model name, Schema, collection name
mongoose.model('AccountStats', AccountStats, 'account_stats');
module.exports = mongoose.model('AccountStats');
