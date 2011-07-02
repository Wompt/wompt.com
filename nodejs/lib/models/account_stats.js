var wompt = require("../includes"),
mongoose = wompt.mongoose,
ObjectId = mongoose.Schema.ObjectId;

var AccountStats = new mongoose.Schema({
	account_id         : {type: ObjectId, index: true}
	,frequency         : String
	,t                 : Date
	,peak_connections  : Number
	,connections       : Number
	,msgs_in           : Number
	,msgs_out          : Number
	,new_conn          : Number
});

AccountStats.index({t: -1, frequency: 1});


// Model name, Schema, collection name
mongoose.model('AccountStats', AccountStats);
module.exports = mongoose.model('AccountStats');
