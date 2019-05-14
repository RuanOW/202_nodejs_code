# Week 2 Notes

## Refactoring into explicit events

Last week we saw that we can create a node server to accept requests and return responses. There is essentially an event being bound here which triggers when a request arrives. This isn’t entirely clear
from the code that we have already so let’s refactor slightly.

```javascript
var http = require('http');
var server = http.createServer();
server.on('request', function(request, response) {
 response.writeHead(200);
 response.write("<h1>Hello world!</h1>");
 response.end();
});
server.listen(8888, function(){
 console.log('Listening on port 8888...');
});
```

It should now be clearer that the `request` event is being bound with the on keyword and the
corresponding callback is triggered when the even occurs. This is more similar to the syntax we have
seen in, for example, jQuery.

### Streaming Responses

One very cool aspect of Node is that fact that it supports streaming responses back to the browser. This is
very experimental so only new browsers support it. A streamed response returns chunks of data piece by
piece so the browser can get started while the request is still running. This is a similar concept to the idea of
a streamed video: You don’t need to download the whole video file before you start watching. Instead, the
video is downloaded in pieces (in order) and buffered into memory so you can start watching right away.

In JavaScript, we can use `setInterval` to have a function executed asynchronously over and over after a number of milliseconds have passed. Let’s use `setInterval` and `clearInterval` to perform a countdown at one-second (100 millisecond) intervals. This is very useful for when we want to send back large chunks
of data which need to be loaded from different data sources (databases, web APIs without destroying the user experience.

```javascript
var http = require('http');

var server = http.createServer();

server.on("request", function(request, response) {
    response.writeHead(200);
    var i = 5;
    var interval = setInterval(function() {
    response.write("<p>" + i + "</p>");
    i--;
    if (i === 0) {
    clearInterval(interval);
    response.write("<p>Bang!</p>");
    response.end();
}
}, 1000);
});
server.listen(8888, function(){
 console.log('Listening on port 8888...');
});
```

This will print out our numbers in one-second intervals in the browser. Note that this does not work if
you send a Postman request. Since Postman isn’t a browser it does not support streaming responses, so
we need to wait the full 5 seconds before the full response is returned at once.

### Returning HTML

Ok, that’s enough experimenting for now. Time to start working on the personal message service
functionality. When the user first hits the page, we want to return a form so the user can enter their
username. Update your request event callback, like so:

```javascript
server.on("request", function(request, response) {
 response.write('<DOCTYPE html>');
 response.write('<html>');
 response.write('<body>');
 response.write('<form method="POST">');
 response.write('<label for="username">Username:</label>');
 response.write('<input type="text" name="username">');
 response.write('<input type="submit" value="submit">');
 response.write('</form>');
 response.write('</body>');
 response.write('</html>');
 response.end();
});
```

When you run this you will likely just see the raw HTML injected into the browser, rather than being
marked up. This is because, by default, the responses from node are treating as being plain text.

### Setting content types and headers

To get the return values treated as HTML instead, we need to specify the content type as a header of
the HTTP response object.

```javascript
server.on("request", function(request, response) {
 response.writeHead(200, {"Content-Type": "text/html"});
 …
 response.end();
});
```

Great! The form is being marked up as HTML. Enter a value and submit the form. At the moment, this
will simply refresh the page. Why? The form sends a request to `http://localhost:8080` and gets a fresh
copy of the form from the server. We need to do some very basic routing here: Return the HTML for the
form if we receive a GET request. If however, the form was submitted, we will get a POST request. We
can then return a message instead.
The method associated with the request is stored in request.method and will be a string value: either
`GET` or `POST`.

### Extracting the method

Let’s refactor the code to display the form into a function called handleFormGet, which takes the
request and response, like so:

```javascript
var http = require('http');
var handleFormGet = function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  …
  response.end();
};
var handleFormPost = function(request, response) {
  response.writeHead(501);
  response.end();
};
var server = http.createServer();
server.on("request", function(request, response) {
  if ('GET' === request.method) {
  handleFormGet(request, response);
  } else if ('POST' === request.method) {
  handleFormPost(request, response);
  } else {
  response.writeHead(404);
  response.end();
  }
});
```

### The "data" and "end" events

Let’s add some code to handle the `POST`. We’ll need to add two new events in here: One for **“receive a chunk of data”** and one for **“receive the end of the request.”** We’ll use the data handling callback to
extract the username data.

First, we need to require the built-in `queryString` dependency, which will help us parse form data into a
plain old JavaScript object so we can extract data more easily.

```javascript
var http = require('http');
var queryString = require('queryString');
```

### Extracting data from a POST

```javascript
var handleFormPost = function(request, response) {
 response.writeHead(200, {"Content-Type": "text/html"});
 var body = '';
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
};
```

Restart the server and send a GET to see the form, and then submit. You should now see a message
including the username that was extracted from the POST request.