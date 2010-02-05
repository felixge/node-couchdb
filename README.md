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
      client = couchdb.createClient('localhost', 5984),
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

## Todo

* Authentication
* Write docs

## Limitations

* Streaming attachments is not supported at this point (patches welcome)
* Etags are only available via client.request({full: true})