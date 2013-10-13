exports.psqlConnectErrorHandler = function(err){
	if(err){
        	console.error('Could not connect to postgresql', err);
    }
}
exports.psqlSQLExecutionErrorHandler = function(err){
	if(err){
		console.error('Could not execute the query ',err);
		client.end();
		res.send(501,err);
	}
}
