require('./common');

var
  DB_NAME = 'node-couchdb-test',

  callbacks = {
    A: false,
  },

  db = client.db(DB_NAME);

// Init fresh db
db.remove().addErrback(function() {});
db.create();

db.saveDoc({test: 1});
db.saveDoc({test: 2});

db
  .changes({since: 1})
  .addCallback(function(r) {
    callbacks.A = true;
    assert.equal(2, r.results[0].seq);
    assert.equal(1, r.results.length);
  });

process.addListener('exit', function() {
  checkCallbacks(callbacks);
});