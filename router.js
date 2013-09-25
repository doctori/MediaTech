function route(handle,pathname,response,postData) {
	console.log("Routing for that pathname " + pathname + " with " + postData);
	if( typeof handle[pathname] == 'function'){
		handle[pathname](response,postData);
	}else{
		console.log("No Request Handler found for "+ pathname);
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not Found");
		response.end();
	}
}
exports.route = route
