require('./common');

var
  DB_NAME = 'node-couchdb-test',

  callbacks = {
    A: false,
    B: false,
    C: false,
    D: false,
    E: false,
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

        db
          .getAttachment('logo-doc', 'logo.png')
          .addCallback(function(r) {
            callbacks.E = true;
            assert.equal(3010, r.length);
          });
      });
  });

db
  .saveAttachment(
    __dirname+'/fixture/logo.png',
    'logo-2'
  )
  .addCallback(function(r) {
    callbacks.C = true;
    assert.ok(r.ok);
    assert.equal('logo-2', r.id);

    db
      .removeAttachment('logo-2', 'logo.png', r.rev)
      .addCallback(function(r) {
        callbacks.D = true;
        assert.ok(r.ok);
      });
  });

process.addListener('exit', function() {
  checkCallbacks(callbacks);
});