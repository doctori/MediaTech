var restify = require('restify');
var models = require('./models');
	
	function getIndex(req,res,next){
		res.send("éllow Vorld");
	}
	function postVinyles(req, res, next) {
		var V = new models.Vinyles();
		V.code = req.params.code;
		V.title = req.params.title;
		V.year = req.params.year;
		V.description = req.params.description;
		V.picture = req.params.picture;
		V.save(function (){
			res.send(201,req.body);
			});
		
	}
	function getVinyles(req, res, next) {
		models.Vinyles.find().sort('-year').exec(function (arr,data){
			res.send(data);
		});
	}
	function postArtists(req, res, next){
		var A = new models.Artists();
		A.name = req.params.name;
		A.type = req.params.type; 
		A.years.start = req.params.years.start;
		A.years.end = req.params.years.end;
		A.description = req.params.description;
		A.picture = req.params.picture;
		A.save(function(){
			res.send(201,req.body);
			});
	}
	function getArtists(req, res, next){
		models.Artists.find().sort('name').exec(function (arr,data){
			res.send(data);
		});
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
exports.postVinyles = postVinyles;
exports.postArtists = postArtists;
exports.getArtists = getArtists;
exports.getVinyles = getVinyles;
exports.getMessages = getMessages;
exports.getIndex = getIndex;
