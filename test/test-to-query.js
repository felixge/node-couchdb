require('./common');

var query = couchdb.toQuery({
  foo: 'bar',
  very: true,
  stale: 'ok'
});
assert.equal('foo=%22bar%22&very=true&stale=ok', query);