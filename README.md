# Node.js CouchDB module

A thin node.js idiom layer for CouchDB's REST API that tries to stay close to the metal.

## Tutorial

Installation is simple:

    $ cd ~/.node_libraries
    $ git clone git://github.com/felixge/node-couchdb.git

To use the library, create a new file called `my-couch-adventure.js`:

    var
      sys = require('sys'),
      couchdb = require('node-couchdb'),
      client = couchdb.createClient(5984, 'localhost'),
      db = client.db('my-db');

    db
      .saveDoc('my-doc', {awesome: 'couch fun'})
      .addCallback(function() {
        sys.puts('Saved my first doc to the couch!');
      });

    db
      .getDoc('my-doc')
      .addCallback(function(doc) {
        sys.puts('Fetched my new doc from couch:');
        sys.p(doc);
      });

If you are wondering if there is a race-condition in the above example, the answer is no. Each `couchdb.Client` uses an internal queue for its requests, just like `http.Client`. This guarantees ordering. If you want to perform multiple requests at once, use multiple `couchdb.Client` instances.

## API Documentation

### couchdb.toJSON(data)

Identical to `JSON.stringify()`, except that function values will be converted to strings like this:

    couchdb.toJSON({
      foo: 'bar',
      fn: function(a, b) {
        p(a, b);
      }
    })
    // => {"foo":"bar","fn":"function (a, b) {\n    p(a, b);\n  }"}

node-couchdb uses this function everywhere for JSON serialization, this makes it convenient to embed functions.

### couchdb.toQuery(query)

Identical to `querystring.stringify()`, except that boolean values will be converted to `"true"` / `"false"` strings like this:

    couchdb.toQuery({
      include_docs: true
    })
    // => include_docs=true

node-couchdb uses this function everywhere for query serialization, this helps since couchdb expects boolean values in this format.

### couchdb.toAttachment(file)

Takes the path of a `file` and returns a promise that yields a JS object suitable for inline document attachment:

    couchdb
      .toAttachment(__filename)
      .addCallback(function(r) {
        // r => {"content_type":"text/javascript","data":"dmFyCiAgs...="}
      });

Check `dep/mime.js` for a list of recognized file types.

### couchdb.createClient([port, host])

Creates a new `couchdb.Client` for a given `port` (default: `5984`) and `host` (default: `'localhost'`). This client will queue all requests that are send through it, so ordering of requests is always guaranteed. Use multiple clients for parallel operations.

### client.host

The host this client is connecting to. READ-ONLY property

### client.port

The port this client is connecting to. READ-ONLY property

### client.request(path, [query])

Sends a GET request with a given `path` and `query`. Returns a promise that yields a result object. Example:

    client.request('/_uuids', {count: 2})

### client.request(method, [path, query])

Sends a request with a given `method`, `path` and `query`. Returns a promise that yields a result object. Example:

    client.request('get', '/_uuids', {count: 2})

### client.request(options)

Sends a request using the given `options` and return a promise that yields a result object. Available options are:

* `method`: The HTTP method (default: `'GET'`)
* `path`: The request path (default: `'/'`)
* `headers`: Additional http headers to send (default: `{}`)
* `data`: A JS object or string to send as the request body (default: `''`)
* `query`: The query options to use (default: {}).
* `requestEncoding`: The encoding to use for sending the request (default: `'utf8'`)
* `responseEncoding`: The encoding to use for sending the request. If set to `'binary'`, the response is emitted as a string instead of an object and the `full` option is ignored. (default: `'utf8'`)
* `full`: By default the returned promise yields the parsed JSON as a JS object. If `full` is set to true, a `{headers: ..., json: ...}` object is yielded instead. (default: `false`)

Example:

    client.request({
      path: '/_uuids',
      query: {count: 5},
      full: true
    });

## Todo

* Authentication
* Finish docs

## Limitations

* Streaming attachments is not supported at this point (patches welcome)
* Etags are only available via client.request({full: true})