function start(route, handle){
	var restify = require('restify');
	var requestHandlers = require('./requestHandlers');
	var server = restify.createServer();
	server.use(restify.bodyParser());
	server.use(restify.fullResponse());
	server.get('/messages/:hiker',requestHandlers.getMessages)
	server.get('/messages',requestHandlers.getMessages);
	server.post('/messages',requestHandlers.postMessage);

	server.listen(80, function(){
		console.log('%s listenning at %s',server.name, server.url);
	});
}
exports.start = start;
