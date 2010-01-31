process.mixin(require('sys'));

GLOBAL.couchdb = require('../lib/couchdb');
GLOBAL.assert = require('assert');

// Provide a port/host here if your local db has a non-default setup
GLOBAL.client = couchdb.createClient();