var restify = require('restify');
var config = require('./config');
var utils = require('./utils');
var pg = require('pg');

var client  = new pg.Client(config.creds.psql_con_string);
function getIndex(req,res,next){
		res.send("H&low Vorld");
	}
	function postVinyles(req, res, next) {
		pg.connect(config.creds.psql_con_string,function(err,client,done){
		        utils.utils.psqlConnectErrorHandler(err);
			var v = {
				code : req.params.code,
				artist : req.params.artist,
				title : req.params.title,
				year : req.params.year,
				description : req.params.description,
				picture : req.params.picture
			}
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
		var queryBegining = 'SELECT * FROM mediatech.vinyles';
		var queryEnding = ' ORDER BY id';
		var queryMidle = '';
		if(req.params.filterName !== undefined){
                                        if(req.params.filterValue === undefined){
                                                console.error("No Value to get Vinyl filter");
                                        }else{
                                                queryMidle = ' WHERE '+req.params.filterName+' = '+req.params.filterValue;
                                                console.log('Filter '+req.params.filterName+' with value '+req.params.filterValue);
                                        }
                                }
		
		console.log('pouet2');
		pg.connect(config.creds.psql_con_string,function(err,client,done){
                         utils.psqlConnectErrorHandler(err);
			console.log('pouet3');
			var fullquery = queryBegining+queryMidle+queryEnding; 
			console.log(fullquery);
			var query = client.query(fullquery);
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
                utils.psqlConnectErrorHandler(err);
                var query = client.query({ 
					name :"add_record",
					text:"INSERT INTO mediatech.artists (name,dates,description,type) VALUES ($1,ARRAY[$2,$3]::int[],$4,$5);",
					values:[A.name,Number(A.years.start,10),Number(A.years.end,10),A.description,A.type]
				});
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
	function updateArtists(req,res,next){
	pg.connect(config.creds.psql_con_string,function(err,client,done){
		utils.psqlConnectErrorHandler(err);
		if(req.params.artist_id === undefined){
			console.error("fuck it");
		}else{
			var query = client.query({
				name : 'get_one_artist',
				text : 'SELECT id FROM mediatech.artists WHERE id = $1',
				values :[req.params.artist_id]});
			query.on('error', function(error){
				   console.error('error running query',error);
				});
			query.on('end',function(result){
				if(result.rowCount != 1){

					res.send(500);
					done();
				}else{
					var v = {
						id : req.params.artist_id,
						name : req.params.name,
						components : req.params.components,
						genre : req.params.genre,
						type : req.params.type,
						dates : [req.params.years.start,req.params.years.end],
						description : req.params.description,
						img : req.params.images
					}
					console.log(req);
					var query_SET = "SET (";
					var query_VALUE = " = (";
					var values = new Array();
					var Vkeys = new Array();
						for(var key in v){
							if(key != 'id'){
								if(v[key] !== undefined){
									Vkeys.push(key);
								}
							}
						}
						var i = 1;
						Vkeys.forEach(function(key,index,array){
							//if we find an array we have to go deeper
							if(v[key].isArray){
								console.log("HURRAY");
							}
								query_SET += key;
							query_VALUE += " $"+(index+1);
							values.push(v[key]);
							i++;
							if(index<array.length-1){
								query_SET +=",";
								query_VALUE +=",";
							}else{
								query_SET +=")";
								query_VALUE +=")";
							}
						});
					var query_WHERE = " WHERE id = "+v.id+";";
					var query_string = "UPDATE mediatech.artists "+query_SET+query_VALUE+query_WHERE;
					console.log(query_string);
					console.log(values);
					var query = client.query({
						name : 'set_one_artist', 
						text : query_string.toString(),
						values : values});
					query.on('error',function(err){
						res.send(501,err);
						console.error(err);
					});
					query.on('row',function(row){
						console.log(row);
						});
					query.on('end',function(result){
						res.send(201,result);
					});
				}
			});
		}
	});
}
	function postGenres(req, res, next){
		var G = {
			name : req.params.name,
			description : req.params.description
		}
		  pg.connect(config.creds.psql_con_string,function(err,client,done){
                utils.psqlConnectErrorHandler(err);
                var query = client.query({ 
					name :"add_genre", 
					text:"INSERT INTO mediatech.genres (name,description) VALUES ($1,$2);",
					values:[G.name,G.description]
				});
                query.on('error', function(error){
                                res.send(501,error);
				console.error('error running query',error);
				done();
				next();
                        });
			query.on('end',function(result){
				res.send(201,result);
				done();
				next();
			});
		});
	}
	function getGenres(req, res, next){
		console.log(req.params);
		 pg.connect(config.creds.psql_con_string,function(err,client,done){
                        utils.psqlConnectErrorHandler(err);
                        var query = client.query('SELECT * FROM mediatech.genres ORDER BY id');
                        query.on('error', function(error){
                                console.error('error running query',error);
                        });
                        var rows = [];
                        query.on('row',function(row){
                                rows.push(row);
                        });
                        query.on('end',function(result){
                                res.send(200,rows);
                                done();
                        });
                });

	}
	function getArtists(req, res, next){
		 pg.connect(config.creds.psql_con_string,function(err,client,done){
                        utils.psqlConnectErrorHandler(err);
                        var query = client.query('SELECT * FROM mediatech.artists ORDER BY id');
                        query.on('error', function(error){
                                console.error('error running query',error);
                        });
                        var rows = [];
                        query.on('row',function(row){
                                rows.push(row);
                        });
                        query.on('end',function(result){
                                res.send(200,rows);
                                done();
                        });
                });

	}
	function updateVinyles(req,res,next){
	pg.connect(config.creds.psql_con_string,function(err,client,done){
		utils.psqlConnectErrorHandler(err);
		if(req.params.vinyle_id === undefined){
			console.error("fuck it");
		}else{
			console.log(req.params.vinyle_id);
			var query = client.query({name : 'get_one_record', text : 'SELECT id FROM mediatech.vinyles WHERE id = $1',values :[req.params.vinyle_id]});
			query.on('error', function(error){
				   console.error('error running query',error);
				});
			query.on('end',function(result){
				if(result.rowCount != 1){
					res.send(500);
					done();
				}else{
					var v = {
						id : req.params.vinyle_id,
						serial_nbr : req.params.code,
						artist : req.params.artist,
						genre : req.params.genre,
						title : req.params.title,
						year : req.params.year,
						description : req.params.description,
						img : req.params.picture,
						disc_nbr : req.params.disq_nbr
					}
					var query_SET = "SET (";
					var query_VALUE = " = (";
					var values = new Array();
					var Vkeys = new Array();
						for(var key in v){
							if(key != 'id'){
								if(v[key] !== undefined){
									Vkeys.push(key);
								}
							}
						}
						var i = 1;
						Vkeys.forEach(function(key,index,array){
							query_SET += key;
							query_VALUE += " $"+(index+1);
							i++;
							values.push(v[key]);
							if(index<array.length-1){
								query_SET +=",";
								query_VALUE +=",";
							}else{
								query_SET +=")";
								query_VALUE +=")";
							}
						});
					var query_WHERE = " WHERE id = "+v.id+";";
					var query_string = "UPDATE mediatech.vinyles "+query_SET+query_VALUE+query_WHERE;
					console.log(query_string);
					console.log(values);
					var query = client.query({
						name : 'set_one_record', 
						text : query_string.toString(),
						values : values});
					query.on('error',function(err){
						res.send(501,err);
						console.error(err);
					});
					query.on('row',function(row){
						console.log(row);
						});
					query.on('end',function(result){
						res.send(201,result);
					});
				}
			});
		}
	});
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
exports.updateArtists = updateArtists;
exports.updateVinyles = updateVinyles;
exports.postArtists = postArtists;
exports.postGenres = postGenres;
exports.getGenres = getGenres;
exports.getArtists = getArtists;
exports.getVinyles = getVinyles;
exports.getIndex = getIndex;
