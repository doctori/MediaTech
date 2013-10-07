var restify = require('restify');
module.exports = function (server,requestHandlers) {

	server.get('/', requestHandlers.getIndex);
	server.post('/messages',requestHandlers.postMessage);
	server.put('/vinyles/:vinyle_id',requestHandlers.updateVinyles);
	server.post('/vinyles',requestHandlers.postVinyles);
	server.post('/genres',requestHandlers.postGenres);
	server.get('/genres',requestHandlers.getGenres);
	server.get('/vinyles',requestHandlers.getVinyles);
	server.get('/artists',requestHandlers.getArtists);
	server.post('/artists',requestHandlers.postArtists);
}
