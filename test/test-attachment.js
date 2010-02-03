require('./common');

var
  DB_NAME = 'node-couchdb-test',

  callbacks = {
    A: false,
    B: false,
  },

  db = client.db(DB_NAME);

// Init fresh db
db.remove().addErrback(function() {});
db.create();

couchdb
  .toAttachment(__dirname+'/fixture/logo.png')
  .addCallback(function(attachment) {
    callbacks.A = true;
    assert.equal('image/png', attachment.content_type);
    assert.equal(4016, attachment.data.length);

    db
      .saveDoc('logo-doc', {
        name: 'The Logo',
        _attachments: {
          'logo.png': attachment
        }
      })
      .addCallback(function(r) {
        callbacks.B = true;
        assert.ok(r.ok);
        assert.equal('logo-doc', r.id);
      });
  });

process.addListener('exit', function() {
  for (var k in callbacks) {
    assert.ok(callbacks[k], 'Callback '+k+' fired');
  }
});