var http = require('http'); // Require the HTTP module that ships with node
var queryString = require('querystring'); // Require the querystring module to get access to the query information
var fs =  require('fs'); // Require the FS module to get access to the file system.

var server = http.createServer(); // Abstract away the server method for refactoring purposes

// A function to handle the GET Requests
var handleFormGet = function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  fs.readFile('templates/form.html', 'utf8', function(err, data) {
    if (err) { throw err; }
    response.write(data);
    response.end();
  });
}

// A function to handle the POST Requests
var handleFormPost = function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"}); // write the Head to also include the type of content we are sending to the browser
  var body = ''; // Create a variable to store the body data coming in on the request

  request.on('data', function (data) {
    body += data;
  });

  request.on('end', function () {
    var post = queryString.parse(body);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write('<DOCTYPE html>');
    response.write('<html>');
    response.write('<body>');
    response.write('<h3>Hi ' + post['username']);
    response.write('</form>');
    response.write('</body>');
    response.write('</html>');
    response.end();
  });
}


// Call the 'on' method on the server to handle the incoming request
server.on("request", function(request, response) {
 if(request.method === 'GET'){
   //Call the handleFormGet function to handle the GET request
   handleFormGet(request, response);
 } else if(request.method) {
   // Call the handleFormPost function to handle the POST requests
   handleFormPost(request, response);
 } else {
   //Send a 404 error if we don't know the type of request
   response.writeHead(404);
   response.end();
 }
})

server.listen(8080, function() {
  // Console Log this to indicate where the server started.
  console.log('Listening on port 8080...')
});