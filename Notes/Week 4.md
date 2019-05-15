# Week 4 Notes

## Routing

___

### A SIMPLE ROUTER

Our node application is currently doing some very basic routing. When a request arrives we determine what should be returned based on whether the method was a **GET** or a **POST**. However, we are currently handling this with a nested if statement and its clear that if we add any more conditions to this statement it will quickly become complex and difficult to maintain. Today we will refactor this routing logic into a separate helper method and standardise our process. The route is generally determined by the method and the path as well as (sometimes) data in the query string. Add the following helper method before the server definition.

```javascript
var simpleRouter = function(request) {
  var method = request.method;
  var path = request.url;
  var suppliedRoute = {method: method, path: path}
  var routes = [
    {method: 'GET', path: '/', handler: handleFormGet},
    {method: 'POST', path: '/', handler: handleFormPost}
  ];
  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    if ( route.method === suppliedRoute.method &&
      route.path === suppliedRoute.path ) {
      return route.handler;
    }
  }
  return null;
}
```

___

### UPDATING THE REQUEST HANDLER

This method checks the route supplied by the user (determined by checking the URL and method in the HTTP request) and returns a handler (function), which can be invoked by the caller. Let’s refactor the `server.on("request")` callback to do this.

```javascript
server.on("request", function(request, response) {
  var handler = simpleRouter(request);

  if (handler != null) {
    handler(request, response);
  } else {
    response.writeHead(404);
    response.end();
  }
});
```

Great! Everything should work as we expect. However, there is one issue. If we send along a query string with the request it breaks everything. Try typing the following into your browser:

<http://localhost:8080/?q=Hi>

___

### STRIPPING QUERIES

Since the URL is now `/?q=Hi` the supplied route doesn’t match any registered routes. We need to make sure to strip the query string before setting up the **suppliedRoute** object in **simpleRouter**. Note that I am using url to refer to the full **URL** and **path** to refer the query-stripped URL.

```javascript
var method = request.method;
var path = request.url;
var queryIndex = request.url.indexOf('?');
if (queryIndex >= 0) {
  path = request.url.slice(0, queryIndex)
}
var suppliedRoute = {method: method, path: path}
```