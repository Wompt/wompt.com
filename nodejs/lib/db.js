var wompt        = require('./includes'),
    mongoose     = require('mongoose');

exports.db = mongoose.connect('mongodb://' + wompt.env.db_host + '/' + wompt.env.db_name);
