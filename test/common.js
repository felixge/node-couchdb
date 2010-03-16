var sys = require('sys');
global.p = sys.p;
global.puts = sys.puts;

global.couchdb = require('../lib/couchdb');
global.assert = require('assert');
global.checkCallbacks = function(callbacks) {
  for (var k in callbacks) {
    assert.ok(callbacks[k], 'Callback '+k+' fired');
  }
};

// Provide a port/host here if your local db has a non-default setup
GLOBAL.client = couchdb.createClient();