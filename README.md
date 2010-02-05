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

Identical to `JSON.stringify()`, except that function value will be converted to strings like this:

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

Takes the path of a `file` and creates an JS object suitable for inline document attachment out of it:

    couchdb
      .toAttachment(__filename)
      .addCallback(function(r) {
        // r => {"content_type":"text/javascript","data":"dmFyCiAgs...="}
      });

Check `dep/mime.js` for a list of recognized file types.

## Todo

* Authentication
* Finish docs

## Limitations

* Streaming attachments is not supported at this point (patches welcome)
* Etags are only available via client.request({full: true})