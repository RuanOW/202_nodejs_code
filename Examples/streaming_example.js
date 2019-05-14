// Require the HTTP module
var http = require('http');
// Refactor into a server variable
var server = http.createServer();

// Call the 'on' method get access to the request and response objects
server.on("request", function(request, response){
  //Let the browser know that the request was successful
  response.writeHead(200);
  // Set the iteration amount
  var i = 5;
  // Create a interval variable that is set to 'setInterval' 
  //function that will stream the data to the browser
  var interval = setInterval(function(){
    response.write('<p>' + i + '</p>'); // Run this the amount of times set in the 'i' variable
    i--; // Deduct from the i variable after each iteration
    if(i === 0){
      clearInterval(interval); //stop the iteration loop with the clearInterval method
      response.write('BANG!'); // Write the last response before ending the response stream
      response.end();
    }
  }, 1000);
})

//Start the server by calling the 'listen' function
server.listen(8080, function() {
  console.log('Listening on port 8080...');
})