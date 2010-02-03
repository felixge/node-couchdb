require('./common');

var
  DB_NAME = 'node-couchdb-test',
  TEST_ID = 'my-doc',
  TEST_ID2 = 'my-doc2',
  TEST_DOC = {hello: 'world'},

  callbacks = {
    A: false,
    B: false,
    C: false,
    D: false,
    E: false,
    F: false,
    G: false,
    H: false,
    I: false,
    J: false,
    K: false,
    L: false,
    M: false,
    N: false,
  },

  db = client.db(DB_NAME);

// Cleanup if test crashed in the middle
db
  .remove()
  .addErrback(function() {});

// Make sure our test db does not exist yet
db
  .exists()
  .addCallback(function(r) {
    callbacks.A = true;
    assert.equal(false, r);
  });

// Now create it
db
  .create()
  .addCallback(function(r) {
    callbacks.B = true;
  });

// Make sure that worked
db
  .exists()
  .addCallback(function(r) {
    callbacks.C = true;
    assert.equal(true, r);
  });

// Create a document with a given id
db
  .saveDoc(TEST_ID, TEST_DOC)
  .addCallback(function(r) {
    callbacks.D = true;
    assert.equal(TEST_ID, r.id);
    assert.ok('rev' in r);
  });

// Let couch create a document id for us
db
  .saveDoc(TEST_DOC)
  .addCallback(function(doc) {
    callbacks.E = true;

    // And lets try to delete this one right away
    db
      .removeDoc(doc.id, doc.rev)
      .addCallback(function(r) {
        callbacks.F = true;
      });
  });

// Lets check how we are doing here
db
  .info()
  .addCallback(function(r) {
    callbacks.G = true;
    assert.equal(2, r.doc_count);
  });

// Lets test copying
db
  .copyDoc(TEST_ID, TEST_ID2)
  .addCallback(function(copy) {
    callbacks.H = true;

    // Now lets try to do this again, but this time we need the destRev
    db
      .copyDoc(TEST_ID, TEST_ID2, copy.rev)
      .addCallback(function(r) {
        callbacks.I = true;
      });
  });

// Get a list of all docs
db
  .allDocs()
  .addCallback(function(r) {
    callbacks.J = true;
    assert.equal(3, r.total_rows);
    assert.equal(3, r.rows.length);
  });

// Make sure query options work
db
  .allDocs({limit: 2})
  .addCallback(function(r) {
    callbacks.K = true;
    assert.equal(2, r.rows.length);
  });

// Test allDocsBySeq
db
  .allDocsBySeq()
  .addCallback(function(r) {
    callbacks.L = true;
    assert.ok('rows' in r);
  });

// Test compact
db
  .compact()
  .addCallback(function(r) {
    callbacks.M = true;
    assert.ok('ok' in r);
  });

// Test bulk docs
db
  .bulkDocs({
    docs: [
      {_id: '1'},
      {_id: '2'},
    ]
  })
  .addCallback(function(r) {
    callbacks.N = true;
    assert.equal('1', r[0].id);
    assert.equal('2', r[1].id);
  });

db
  .tempView({
    map: function() {
      emit(null, null);
    }
  }, {include_docs: true})
  .addCallback(function(r) {
    assert.ok('total_rows' in r);
  });

process.addListener('exit', function() {
  for (var k in callbacks) {
    assert.ok(callbacks[k], 'Callback '+k+' fired');
  }
});