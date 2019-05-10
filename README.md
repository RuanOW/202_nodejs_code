# 202_nodejs_code
<!--
## Week 1 Notes

This term's in-class application will be a browser-based personal messaging service. We'll essentially need to set up a server and
listen over a particular port. When we receive a request from a client, we'll return some HTML.

## Explain the code

### The Code

```javascript
var http = require('http');
```

The first line of the file uses a require statement. The require keyword is not part of JS itself but is used by node to include code from other JS files. Node needs to do this because it's code does not run in a browser environment so there is no way to otherwise include additional JS files (since we can't simply add a `<script>` element anywhere. The required http dependency includes all the code necessary to boot an HTTP server.

```javascript
http.createServer(function(request, response){...
  }).listen(8080, function(){
    console.log('Listening on port 8080');
  })
```

Note that createServer and listen both make use of callback functions for their bodies. This is a very common pattern in node because it is event driven and non-blocking. By event driven I mean that everything in node happens in response to an event. We have seen this pattern before in, for example, jQuery where functions are registered to particular events (such as "when the #btn button is clicked" or "the pages finishes loading") and run only when those events are triggered by the user.

By non-blocking I mean that the application does not freeze while carrying out a single request. We'll talk about Node's event loop to get a deeper understanding, once we have finished with the code analysis.

### The Code Body

```javascript
  response.writeHead(200);
  response.write("<h1>Hello World!</h1>");
  response.end();
```

The body of createServer sends a response to the client (browser, cURL, Postman) by running methods of the response object that gets injected into the callback as a parameter. (You will notice that the request in inject too. We'll make good use of this in later lessons)

The writeHead method sets the status code of the response to 200, which, as you know, means "OK" or "success." The write method sets the body/data to be returned. This is usually HTML, but it could also take the form of plaintext, XML, JSON or even a stream of characters representing an encoded image.

Finally, the end method returns the response.

```javascript
console.log('Listening on port 8080...');
```

The body of listen simply prints a message to the console (which in Node's case isn't a browser's JS
console, but the terminal) specifying the port number. This is useful for logging and debugging.

### The Even Loop

JavaScript does not have native support for concurrency (ie. running multiple subprograms simultaneously)

To get around this, node created the event loop. Essentially, when a node server starts up it enters and infinite loop which checks for a new event, then runs its corresponding callback asynchronously, then moves on to the next event. The pseudocode might look something like this:

```javascript
while (true) {
var event = getNextEvent();
var callback = getCallbackFor(event);
event.callAsynchronously(callback);
}
```

Without this pattern, all node applications would freeze while waiting for long actions (like loading a file) to complete before servicing the newt request. For example, image 360 people on a single node website and a particular page takes 1 second to load from a server-side file. If all 360 people decided to visit the same
page within a few milliseconds of each other, the last user to be served would have to wait 6 minutes (!) to load one page. In the event-loop based non-blocking model, however, all the requests are handled simultaneously and each user loads the page in just over a second.
-->

## Week 2 Notes

### Refactoring into explicit events

Last week we saw that we can create a node server to accept requests and return responses. There is
essentially an event boing bound here which triggers when a request arrives. This isn’t entirely clear
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

In JavaScript, we can use `setInterval` to have a function executed asynchronously over and over after anumber of milliseconds have passed. Let’s use `setInterval` and `clearInterval` to perform a countdown at one-second (100 millisecond) intervals. This is very useful for when we want to send back large chunks
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

First, we need to require the built-in `querystring` dependency, which will help us parse form data into a
plain old JavaScript object so we can extract data more easily.

```javascript
var http = require('http');
var querystring = require('querystring');
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
 var post = querystring.parse(body);
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