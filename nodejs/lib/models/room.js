var wompt = require("../includes"),
    mongoose = wompt.mongoose;

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var Room = new Schema({
	'name'             : String
	,'namespace'       : String
});

Room.index({name: 1, namespace:1});

Room.static({
	findOrCreate: function(attributes, callback){
		this.findOne(attributes, function(err, room){
			if(!room){
				room = new wompt.models.Room();
				room.set(attributes);
				room.save();
			}
			callback(room);
		});
	}
})

// Model name, Schema, collection name
mongoose.model('Room', Room, 'rooms');
module.exports = mongoose.model('Room');
