function start(route, handle){
	var restify = require('restify');
	var requestHandlers = require('./requestHandlers');
	var server = restify.createServer();
	var port = process.env.port || 1337;
	server.use(restify.bodyParser());
	server.use(restify.fullResponse());
	server.get('/', requestHandlers.getIndex);
	server.get('/messages/:hiker',requestHandlers.getMessages);
	server.get('/messages',requestHandlers.getMessages);
	server.post('/messages',requestHandlers.postMessage);

	server.listen(port, function(){
		console.log('%s listenning at %s',server.name, server.url);
	});
}
exports.start = start;
