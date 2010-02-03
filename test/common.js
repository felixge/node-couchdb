process.mixin(require('sys'));

GLOBAL.couchdb = require('../lib/couchdb');
GLOBAL.assert = require('assert');
GLOBAL.checkCallbacks = function(callbacks) {
  for (var k in callbacks) {
    assert.ok(callbacks[k], 'Callback '+k+' fired');
  }
};

// Provide a port/host here if your local db has a non-default setup
GLOBAL.client = couchdb.createClient();