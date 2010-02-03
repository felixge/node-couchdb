require('./common');

var
  callbacks = {
    A: false,
    B: false,
    C: false,
    D: false,
    E: false,
    F: false,
  };

client
  .request('/_uuids')
  .addCallback(function(r) {
    callbacks.A = true;
    assert.ok(1, r.uuids.length);
  });

client
  .request('/_uuids', {count: 2})
  .addCallback(function(r) {
    callbacks.B = true;
    assert.ok(2, r.uuids.length);
  });

client
  .request('get', '/_uuids', {count: 3})
  .addCallback(function(r) {
    callbacks.C = true;
    assert.ok(3, r.uuids.length);
  });

client
  .request({
    path: '/_uuids',
    query: {count: 4},
  })
  .addCallback(function(r) {
    callbacks.D = true;
    assert.ok(4, r.uuids.length);
  });

client
  .request({
    path: '/_uuids',
    query: {count: 5},
    full: true
  })
  .addCallback(function(r) {
    callbacks.E = true;
    assert.ok('headers' in r);
    assert.ok(5, r.json.uuids.length);
  });

client
  .request('post', '/_uuids')
  .addErrback(function(r) {
    callbacks.F = true;
    assert.equal('method_not_allowed', r.error);
  });

process.addListener('exit', function() {
  checkCallbacks(callbacks);
});