# 202_nodejs_code

This file contains only the current week notes for easy access. The previous weeks' notes are commented out so that this file always has all of the notes at the end of the class.

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

To get around this, node created the event loop. Essentially, when a node server starts up it enters and infinite loop which checks for a new event, then runs its corresponding callback asynchronously, then moves on to the next event. The pseudo code might look something like this:

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

<!--
## Week 2 Notes

### Refactoring into explicit events

Last week we saw that we can create a node server to accept requests and return responses. There is
essentially an event being bound here which triggers when a request arrives. This isn’t entirely clear
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
-->

# Week 3 Notes

## Templates

### REFACTORING INTO HTML

Last week we returned some HTML from our node server by `calling response.write(data);` on each line of HTML we wanted to return. While this works, it makes the HTML quite difficult to read, write, and maintain. Let’s move the HTML from the **handleFormGet** method to a separate file. Create a directory called **templates** in your project folder and add a file called **form.html** to that directory. The **form.html** simply holds the HTML we want to return when the form is requested.

```html
<!DOCTYPE html>
<html>
  <body class="template">
    <form method="POST">
      <label for="username">Username:</label>
      <input type="text" name="username">
      <input type="submit" value="submit">
    </form>
  </body>
</html>
```
___
### FILE STREAM

Now, we need to read this file from the disk and send the HTML back to the client browser. JavaScript doesn’t have built in support for handling files (since it usually runs client side, where file handling is not allowed for security reasons) but node has a built-in module called **fs** (short for filestream), which includes this functionality.

Let’s include it and refactor.

```javascript
var http = require('http');
var queryString = require('queryString');
var fs = require('fs');

var handleFormGet = function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  fs.readFile('templates/form.html', 'utf8', function(err, data) {
    if (err) { throw err; }
    response.write(data);
    response.end();
  });
};
```
___
### INTERPOLATION

The **handleFormGet** method now reads the form file as **UTF8** (the character formatting of the file) and runs a callback function when done. This callback function takes an error and some data as parameters. If the error is not **undefined** or **null**, the `if (err)` expression will evaluate to true, and node will throw the error so we can debug it in the console. Otherwise, we simply write the HTML content from the file to the response.

Let’s do the same for the **handleFormPost**. First, add the HTML to a file called **templates/contacts.html**

```html
<!DOCTYPE html>
<html>
  <body class="template">
    <h3>Hi + post[username]</h3>
  </body>
</html>
```
___
### DOWNLOADING THE TEMPLATE STRING MODULE

Hmm... This isn’t going to work. The **post[username]** is actually a JS expression, but it isn’t going to be evaluated since this is HTML, not JS. What we’ll have to do is change this to interpolation syntax and inject the appropriate value into the template from JS before sending it as the response body.

```html
<!DOCTYPE html>
<html>
  <body class="template">
    <h3>Hi ${username}</h3>
  </body>
</html>
```

Node doesn’t have any built in modules to handle ES6 interpolation syntax so we need to download a module to do this with NPM. First, we need to initialise this project as an NPM project to create a **package.json** file, then download that dependency. You may have used NPM before to download modules just to include a JS file for the module using a `<script>` element, but today we will be using the require keyword to pull in the module’s functionality.

```sh
npm init
```

This will ask you a few questions on the page that you want to create. If you want to accept the default you can add\
 `--yes` at the end of the init command

```bash
npm install --save es6-template-strings
```

### USING THE TEMPLATE STRING MODULE

Now, in the **server.js** file, let’s update the require statements to include the es6-template-strings module, and refactor **handleFormPost** to read the contacts.html template, interpolate in the username value and return the resulting data.

```javascript
var fs = require('fs');
var template = require('es6-template-strings');
// ...
var handleFormPost = function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  var payload = '';

  request.on('data', function (data) {
    payload += data;
  });

  request.on('end', function () {
    var post = querystring.parse(payload);
    response.writeHead(200, {"Content-Type": "text/html"});
    fs.readFile('templates/contacts.html', 'utf8', function(err, data) {
      if (err) { throw err; }
      var compiled = template(data, {username: post['username'] });
      response.write(compiled);
      response.end();
    });
  });
};
```

___

## Multiple Connections

___

### STORING CONTACTS

Great! Now, lets add a global list for the usernames of all users who have logged in so far. We’ll call this list “contacts” since it will include the names of all the users who can be contacted.

```javascript
var http = require('http');
var queryString = require('querystring');
var fs = require('fs');
var template = require('es6-template-strings');
var contacts = [];
```

Now, in the handleFormPost, let’s send through a string of all the names in the contacts list separated by commas. We’ll add some interpolation syntax to use this data shortly.

```javascript
var handleFormPost = function(request, response) {
  // ...
  request.on('end', function () {
    var post = querystring.parse(payload);
    contacts.push(post['username']);
    response.writeHead(200, {"Content-Type": "text/html"});
    fs.readFile('templates/contacts.html', 'utf8', function(err, data) {
      if (err) { throw err; }
      var compiled = template(data, {username: post['username'], userList: contacts.join(",")});
      response.write(compiled);
      response.end();
    });
  });
};
```

### PROGRAM STATES

Now, output the list of contacts in the **contacts.html** template:

```html
<!DOCTYPE html>
<html>
  <body class="template">
    <h3>Hi ${username}</h3>
    <p>You can contact:</p>
    <ul>
      ${userList}
    </ul>
  </body>
</html>
```

To test that this works, start the server and go to **localhost:8888**. Now, enter a username to log in. Then, go back and log in again with a different username. You should see both usernames appearing in the list.

There are some obvious disadvantages to storing the logged in users this way. First of all, using global variables is bad practice. Second, the data is not persistent (as soon as the server is restarted, all the contacts in the list will be lost.) We can fix these issues by either using the **fs** module’s **writeFile** method or using a database. We’ll take a look at the **writeFile** option later in the term.