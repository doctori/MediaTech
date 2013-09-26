var restify = require('restify');
module.exports = function (server,requestHandlers) {

	server.get('/', requestHandlers.getIndex);
	server.get('/messages/:hiker',requestHandlers.getMessages);
	server.get('/messages',requestHandlers.getMessages);
	server.post('/messages',requestHandlers.postMessage);
	server.post('/vinyles',requestHandlers.postVinyles);
	server.get('/vinyles',requestHandlers.getVinyles);
	server.get('/artists',requestHandlers.getArtists);
	server.post('/artists',requestHandlers.postArtists);
}
