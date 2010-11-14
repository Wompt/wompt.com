var wompt        = require('./includes'),
    mongoose     = wompt.mongoose;

exports.db = mongoose.connect('mongodb://localhost/wompt_dev');
