# 202_nodejs_code

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