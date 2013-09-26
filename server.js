	var restify = require('restify');
	var requestHandlers = require('./requestHandlers');
function start(){


	var server = restify.createServer({
	name: 'mediatech'});
	var port = process.env.port || 1337;
	server.use(restify.bodyParser());
	server.use(restify.fullResponse());
	//Sendings every event to the router funciton
	require('./route')(server,requestHandlers);

	server.listen(port, function(){
		console.log('%s listenning at %s',server.name, server.url);
	});
}
exports.start = start;
