var mongoose = require('mongoose');
var config = require('./config');
	db = mongoose.connect(config.creds.mongoose_auth_local);
	Schema = mongoose.Schema;
	var MessageSchema = new Schema({
		message: String,
		hiker: String,
		date : Date
	});
	var VinylesSchema = new Schema({
		title: String,
		code : String,
		_artist: Schema.Types.ObjectId,
		year: {type : Number, min : 1900},
		description : String,
		picture : String,
		genre : String
	});
	var ArtistSchema = new Schema({
		name: String,
		type : String,
		years: { 
			start : {type : Number, min : 1900, max : 2100 },
			end : Number
			},
		description : String,
		picture : String			
	});
exports.Message = mongoose.model('messages',MessageSchema);
exports.Vinyles = mongoose.model('vinyles', VinylesSchema);
exports.Artists = mongoose.model('artists', ArtistSchema);

