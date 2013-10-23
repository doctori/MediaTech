var restify = require('restify');
var config = require('./config');
var utils = require('./utils');
var pg = require('pg');

var client  = new pg.Client(config.creds.psql_con_string);
function getIndex(req,res,next){
		res.send("H&low Vorld");
	}
	function postUser(req,res,next) {
		console.log('inside PostUSer');
		pg.connect(config.creds.psql_con_string,function(err,client,done){
			utils.psqlConnectErrorHandler(err);
			var u = {
				name : req.params.name,
				email : req.params.email,
				bio :	req.params.bio
			}
			var user_query = client.query({
				name : 'put_user',
				text : 'INSERT INTO mediatech.users ( name, email, bio, creationDate)	VALUES ($1, $2, $3, NOW())',
				values:[u.name, u.email, u.bio]
				},function(err,result){
					utils.psqlSQLExecutionErrorHandler(err);
					done()
					res.send(201);
			});
		}); 
	}
	function getUsers(req,res,next){
		
		pg.connect(config.creds.psql_con_string,function(err,client,done){
			var query = 'SELECT * FROM mediatech.users ORDER BY creationdate DESC';
			 utils.psqlConnectErrorHandler(err);
			 console.log(query);
			var query = client.query(query);
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
	function getMediaId(req, res, next){
		if(req.params.type !== undefined && req.params.sub_id !== undefined){
			pg.connect(config.creds.psql_con_string,function(err,client,done){
				utils.psqlConnectErrorHandler(err);
				var query = "SELECT media_typed_id FROM mediatech.medias_typed WHERE type = $1 AND sub_id = $2;"
				var get_media_id = client.query({
					name : "get_media_id",
					text : query,
					values : [req.params.type, req.params.sub_id]
				});
				get_media_id.on('row',function(result){
					res.send(201,result.media_typed_id);
				});
			});
		}
	}
	function setMediaId(mediaType,mediaSubId,res,user,callback){
		pg.connect(config.creds.psql_con_string,function(err,client,done){
			utils.psqlConnectErrorHandler(err);
			var query = "SELECT media_typed_id FROM mediatech.medias_typed WHERE type = $1 AND sub_id = $2";
			var get_media_ID = client.query({
				name: "get_media_id",
				text:query,
				values:[mediaType,mediaSubId]
			});
			get_media_ID.on('end',function(result){
				if(result.rowCount == 0){
					var insertQuery = 'INSERT INTO mediatech.medias_typed (type,sub_id, media_typed_id) VALUES ($1,$2,DEFAULT) RETURNING media_typed_id';
					var insert_media_ID = client.query({
						name: "insert_media_id",
						text: insertQuery,
						values:[mediaType,mediaSubId]
					});
					insert_media_ID.on('row',function(row){
						console.log(row.media_typed_id	)
						callback(res,row.media_typed_id,user);
						return(row.media_typed_id);
					});
				}else{
					return false;
				}
			});
		});
	}
	function owns(userId,media_id,res,callback) {
			console.log(userId);
			pg.connect(config.creds.psql_con_string,function(err,client,done){
				utils.psqlConnectErrorHandler(err);
				var get_user_query = "SELECT owns_id FROM mediatech.owns " +
									"WHERE user = $1 AND media_id = $2 AND type = 1";
				var get_user = client.query({
					name: "get_user",
					text: get_user_query,
					values : [userId,media_id]
				});
				get_user.on('end',function(result){
					if( result.rowCount >= 1){
						
						return(false);
					}else{
						console.log('fuck it');
						var insert_owns_query = 'INSERT INTO mediatech.owns('+
											'owns_id, "user", type, media_id)'+
											'VALUES (DEFAULT,$1,1,$2) RETURNING owns_id';
						var insert_owns = client.query({
							name: "set_owns",
							text: insert_owns_query,
							values : [userId,media_id]
						});
						console.log(insert_owns);
						insert_owns.on('error', function(error){
							   console.error('error running query',error);
							});
						var owns_id;
						insert_owns.on('row',function(row){
							console.log("pouet")
							owns_id = row.owns_id;
							console.log(owns_id);
						});
						insert_owns.on('end',function(result){
							callback(res,media_id);
							return(row.owns_id);
						});
					}
				});
			});
	}
	function postVinyles(req, res, next) {
		pg.connect(config.creds.psql_con_string,function(err,client,done){
			utils.psqlConnectErrorHandler(err);
			var v = {
				code : req.params.code,
				artist : req.params.artist,
				title : req.params.title,
				year : req.params.year,
				description : req.params.description,
				picture : req.params.picture,
				user : req.params.user
			}

			var artist_query = client.query({
				name : "get_artists",
				text:"SELECT id FROM mediatech.artists WHERE name = $1;",
				values:[v.artist]})
				var artist_id  = new Array();
			var user_id;
			artist_query.on('row',function(row){
				artist_id = row.id;
			});
			artist_query.on('end',function(result){
				if(result.rowCount >= 1){
					console.log('artist found');
					 var user_query = client.query({
						name : "get_user",
						text:"SELECT id FROM mediatech.users WHERE name = $1;",
						values:[v.user]
					});
					 var userId = 0;
			 		user_query.on('row',function(row){
			 			userId = row.id;
			 		})
					user_query.on('end',function(userResult){
						console.log(userId)
						if(userResult.rowCount >= 1){
							
							
							var query = client.query({ 
							name :"add_record", 
							text:'INSERT INTO mediatech.vinyles (id,title,serial_nbr,year,description,img,artist)'+
									'VALUES (DEFAULT,$1,$2,$3,$4,$5,$6) RETURNING id;',
							values:[
							        v.title,
							        v.code,
							        v.year,
							        v.description,
							        v.picture,
							        artist_id
							       ]
						},function(err,result){
							if(err){
								return console.error('error running query',err);
								client.end();
								res.send(501,err);
							}else{
								setMediaId('vinyles',result.rows[0].id,res,userId,function(res,media_id,userId){
									console.log('fouck ? ')
									owns(userId,media_id,res,function(res,media_id){
										res.send(201,media_id);
									})
								})
							}
							console.log(result.rows[0].id);
							done();
							
						});
					}else{
						done();
						res.send(404,"User Not Found");
					}
				});
			}else{
				done();
				res.send(404,"No Artist Found");
			}
			});
		});
	}
	
	function getUserId(user){
		console.log('inside getUserId')
		if(user.length <2){
			return(false);
		}else{
			pg.connect(config.creds.psql_con_string,function(err,client,done){
				utils.psqlConnectErrorHandler(err);
				var query = 'SELECT id FROM mediatech.users WHERE name = $1'
				 var user_query = client.query({
						name : "get_user",
						text:query,
						values:[user]
					});
				user_query.on('error', function(error){
					   console.error('error running query user ID query',error);
					});
				user_query.on('end',function(result){
					if(result.rowCount == 1){
						console.log(result.rows)
						return(result.rows[0].id);
					}else{
						return(false);
					}
				})
			})	
		}
		
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
		

		pg.connect(config.creds.psql_con_string,function(err,client,done){
                         utils.psqlConnectErrorHandler(err);

			var fullquery = queryBegining+queryMidle+queryEnding; 
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
exports.postUser    = postUser;
exports.updateArtists = updateArtists;
exports.updateVinyles = updateVinyles;
exports.postArtists = postArtists;
exports.postGenres = postGenres;
exports.getGenres = getGenres;
exports.getArtists = getArtists;
exports.getVinyles = getVinyles;
exports.getUsers = getUsers;
exports.getIndex = getIndex;
