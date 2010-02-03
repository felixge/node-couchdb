require('./common');

var
  DB_NAME = 'node-couchdb-test',
  DB_NAME2 = 'node-couchdb-test-mirror',
  TEST_ID = 'my-doc',
  TEST_DOC = {hello: 'world'},

  callbacks = {
    A: false,
    B: false,
    C: false,
    D: false,
    E: false,
    F: false,
  };

// Get a list of all databases
client
  .allDbs()
  .addCallback(function(r) {
    callbacks.A = true;    
    assert.ok('length' in r);
  });

// Get the couch config
client
  .config()
  .addCallback(function(r) {
    callbacks.B = true;    
    assert.ok('httpd' in r);
  });

// Get some uuids
client
  .uuids(3)
  .addCallback(function(r) {
    callbacks.C = true;    
    assert.equal(3, r.uuids.length);
  });

// Get the couch stats
client
  .stats()
  .addCallback(function(r) {
    callbacks.D = true;
    assert.ok('httpd_status_codes' in r);
  });

// Find all active tasks
client
  .activeTasks()
  .addCallback(function(r) {
    callbacks.E = true;
    assert.ok('length' in r);
  });

// Lets create two dbs to test replication
var db = client.db(DB_NAME);
db.remove().addErrback(function() {});
db.create();
db.saveDoc(TEST_ID, TEST_DOC);

var db2 = client.db(DB_NAME2);
db2.remove().addErrback(function() {});
db2.create();

client
  .replicate(DB_NAME, DB_NAME2)
  .addCallback(function(r) {
    callbacks.F = true;
    assert.ok('session_id' in r);
  });

// Cleanup
db.remove();
db2.remove();

process.addListener('exit', function() {
  checkCallbacks(callbacks);
});