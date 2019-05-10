// Require the HTTP module that ships with node
var http = require('http')

//Use the create server function that the HTTP module exposes through the module.exports
http.createServer(function(request, response) {
  // The body sent to the browser
  response.writeHead(200);
  response.write("<h1>Hello World!</h1>");
  response.end();
  // Let the server listen on a port and provide some feedback for the developer with a callback that the listen function provides
}).listen(8080, function() {
  // Console Log this to indicate where the server started.
  console.log('Listening on port 8080...')
});