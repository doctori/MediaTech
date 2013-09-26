var restify = require('restify');
var models = require('./models');
	
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
		models.Message.find().sort('-date').exec(function (arr,data){
                                res.send(data);
                        });	
		}else{
			hiker = req.params.hiker;
			 models.Message.find({'hiker' : hiker}).sort('-date').exec(function (arr,data){
	                        res.send(data);
	                });

		}
	return next();
        }

        function postMessage(req,res,next){
                var message = new models.Message();
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
