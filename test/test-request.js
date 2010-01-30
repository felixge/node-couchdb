require('./common');

var
  callbackA = false,
  callbackB = false,
  callbackC = false,
  callbackD = false,
  callbackE = false,
  callbackF = false,
  client = couchdb.createClient();

client
  .request('/_uuids')
  .addCallback(function(r) {
    callbackA = true;
    assert.ok(1, r.uuids.length);
  });

client
  .request('/_uuids', {count: 2})
  .addCallback(function(r) {
    callbackB = true;
    assert.ok(2, r.uuids.length);
  });

client
  .request('get', '/_uuids', {count: 3})
  .addCallback(function(r) {
    callbackC = true;
    assert.ok(3, r.uuids.length);
  });

client
  .request({
    path: '/_uuids',
    query: {count: 4},
  })
  .addCallback(function(r) {
    callbackD = true;
    assert.ok(4, r.uuids.length);
  });

client
  .request({
    path: '/_uuids',
    query: {count: 5},
    full: true
  })
  .addCallback(function(r) {
    callbackE = true;
    assert.ok('headers' in r);
    assert.ok(5, r.json.uuids.length);
  });

client
  .request('post', '/_uuids')
  .addErrback(function(r) {
    callbackF = true;
    assert.equal('method_not_allowed', r.error);
  });

process.addListener('exit', function() {
  assert.ok(callbackA);
  assert.ok(callbackB);
  assert.ok(callbackC);
  assert.ok(callbackD);
  assert.ok(callbackE);
  assert.ok(callbackF);
});