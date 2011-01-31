var wompt        = require('./includes'),
    mongoose     = wompt.mongoose;

exports.db = mongoose.connect('mongodb://' + wompt.env.db_host + '/' + wompt.env.db_name);
