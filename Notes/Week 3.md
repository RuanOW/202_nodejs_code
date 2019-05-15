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