exports.psqlConnectErrorHandler = function(err){
	if(err){
        console.error('Could not connect to postgresql', err);
    }
}
