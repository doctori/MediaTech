var restify = require('restify');
var mongoose = require('mongoose');
        var config = require('./config');
        db = mongoose.connect(config.creds.mongoose_auth_local);
        Schema = mongoose.Schema;
        var MessageSchema = new Schema({
                message: String,
                hiker: String,
                date : Date
        });
        var Message = mongoose.model('messages',MessageSchema);
	function getIndex(req,res,next){
		res.send("éllow Vorld");
	}
	function getMessages(req, res, next) {
		var filter = "";		
		var hiker = "";
		if(req.params.message === undefined){
			var message = '.*';
		}else{
			var message = req.params.message;
		}
		if(req.params.hiker === undefined){
		Message.find().sort('-date').exec(function (arr,data){
                                res.send(data);
                        });	
		}else{
			hiker = req.params.hiker;
			 Message.find({'hiker' : hiker}).sort('-date').exec(function (arr,data){
	                        res.send(data);
	                });

		}
	return next();
        }

        function postMessage(req,res,next){
                var message = new Message();
                if(req.params.message === undefined){
			return next(new restify.InvalidArgumentError(' Message Must Be Supplied'))
		}
                        message.message = req.params.message;
                        message.hiker = req.params.hiker;
                        message.date = new Date();
                        message.save(function (){
                                res.send(201,req.body);
                        });
         }
exports.postMessage = postMessage;
exports.getMessages = getMessages;
exports.getIndex = getIndex;
