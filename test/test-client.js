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
    G: false,
  };

// Get a list of all databases
client
  .allDbs(function(er, r) {
    if (er) throw new Error(JSON.stringify(er));
    callbacks.A = true;    
    assert.ok('length' in r);
  });

// Get the couch config
client
  .config(function(er, r) {
    if (er) throw new Error(JSON.stringify(er));
    callbacks.B = true;    
    assert.ok('httpd' in r);
  });

// Get some uuids
client
  .uuids(3, function(er, r) {
    if (er) throw new Error(JSON.stringify(er));
    callbacks.C = true;    
    assert.equal(3, r.uuids.length);
  });

// Get the couch stats
client
  .stats('httpd_status_codes', '200', function(er, r) {
    if (er) throw new Error(JSON.stringify(er));
    callbacks.D = true;
    assert.deepEqual(['httpd_status_codes'], Object.keys(r));
    assert.deepEqual(['200'], Object.keys(r.httpd_status_codes));
  });

// Find all active tasks
client
  .activeTasks(function(er, r) {
    if (er) throw new Error(JSON.stringify(er));
    callbacks.E = true;
    assert.ok('length' in r);
  });

// Lets create two dbs to test replication
var db = client.db(DB_NAME);
db.remove();
db.create();
db.saveDoc(TEST_ID, TEST_DOC);

var db2 = client.db(DB_NAME2);
db2.remove();
db2.create();

client
  .replicate(DB_NAME, DB_NAME2, function(er, r) {
    if (er) throw new Error(JSON.stringify(er));
    callbacks.F = true;
    assert.ok('session_id' in r);
  });


// Test connecting to a port where there is no couch
var client2 = couchdb.createClient(3921);
client2
  .uuids(function(er, r) {
    if (er) callbacks.G = true;
  });

// Cleanup
db.remove();
db2.remove();

process.addListener('exit', function() {
  checkCallbacks(callbacks);
});