var mongoose = require('mongoose');
        var config = require('./config');
        db = mongoose.connect(config.creds.mongoose_auth_local);
        Schema = mongoose.Schema;
        var MessageSchema = new Schema({
                message: String,
                hiker: String,
                date : Date
        });
        
exports.Message = mongoose.model('messages',MessageSchema);

