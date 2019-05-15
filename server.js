var http = require('http'); // Require the HTTP module that ships with node
var queryString = require('querystring'); // Require the querystring module to get access to the query information
var fs =  require('fs'); // Require the FS module to get access to the file system.
var template = require('es6-template-strings'); //Require our newly installed module that will insert the data into the html file

var contacts = []; // We can use this contacts variable to store all of the contacts that connected to the chat

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
  response.writeHead(200, {"Content-Type": "text/html"});
  var payload = '';

  request.on('data', function (data) {
    payload += data;
  });

  request.on('end', function () {
    var post = queryString.parse(payload);
    contacts.push(post['username']);
    response.writeHead(200, {"Content-Type": "text/html"});
    fs.readFile('templates/contacts.html', 'utf8', function(err, data) {
      if (err) { throw err; }
      var compiled = template(data, {username: post['username'], userList: contacts.join(",")});
      response.write(compiled);
      response.end();
    });
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