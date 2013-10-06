var restify = require('restify');
var config = require('./config');
var pg = require('pg');

var client  = new pg.Client(config.creds.psql_con_string);
function getIndex(req,res,next){
		res.send("H&low Vorld");
	}
	function postVinyles(req, res, next) {
		pg.connect(config.creds.psql_con_string,function(err,client,done){
		        if(err){
        		        console.log('Could not connect to postgresql', err);
        	        }
			var v = new Object();
			v.code = req.params.code;
			v.artist = req.params.artist;
			v.title = req.params.title;
			v.year = req.params.year;
			v.description = req.params.description;
			v.picture = req.params.picture;
			var artist_query = client.query({ name : "get_artist",text:"SELECT id FROM mediatech.artists WHERE name = $1;",values:[v.artist]})
			var artist_id ;
			artist_query.on('row',function(row){
				artist_id = row.id;
			});
			artist_query.on('end',function(result){
				if(result.rowCount == 1){
			 		console.log('artist found');
					
					var query = client.query({ name :"add_record", text:"INSERT INTO mediatech.vinyles (title,serial_nbr,year,description,img,artist) VALUES ($1,$2,$3,$4,$5,$6);",values:[v.title,v.code,v.year,v.description,v.picture,artist_id]},function(err,result){
                        	if(err){
                        	        return console.error('error running query',err);
                        	        client.end();
					res.send(501,err);
                        	}
                        	done();
                        	res.send(201);
				});
			}else{
			done();
				res.send(403,"No Artist Found");
			}
			});
		});
		
	}
	function getVinyles(req, res, next) {
		pg.connect(config.creds.psql_con_string,function(err,client,done){
                        if(err){
                                console.log('Could not connect to postgresql', err);
                        }
			var query = client.query('SELECT * FROM mediatech.vinyles');
			query.on('error', function(error){
				console.error('error running query',error);
			});
			var rows = [];
			query.on('row',function(row){
				rows.push(row);
			});
			query.on('end',function(result){
				res.send(rows);
				done();
			});
		});
	}
	function postArtists(req, res, next){
		var A = {
			name : req.params.name,
			type : req.params.type, 
			years : { 
				start : parseInt(req.params.years.start,10),
				end : parseInt(req.params.years.end,10)
				},
			description : req.params.description,
			type : req.params.type
		}
		  pg.connect(config.creds.psql_con_string,function(err,client,done){
                        if(err){
                                console.log('Could not connect to postgresql', err);
				res.send('501',err);
                        }
                        var query = client.query({ name :"add_record", text:"INSERT INTO mediatech.artists (name,dates,description,type) VALUES ($1,ARRAY[$2,$3]::int[],$4,$5);",values:[A.name,Number(A.years.start,10),Number(A.years.end,10),A.description,A.type]});
                        query.on('error', function(error){
                                res.send(501,error);
				console.error('error running query',error);
				done();
				next();
                        });
			query.on('end',function(result){
				res.send(201,result);
				done();
			});
		});
	}
	function getArtists(req, res, next){
		 pg.connect(config.creds.psql_con_string,function(err,client,done){
                        if(err){
                                console.log('Could not connect to postgresql', err);
                        }
                        var query = client.query('SELECT * FROM mediatech.artists');
                        query.on('error', function(error){
                                console.error('error running query',error);
                        });
                        var rows = [];
                        query.on('row',function(row){
                                rows.push(row);
                        });
                        query.on('end',function(result){
                                res.send(201,rows);
                                done();
                        });
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
