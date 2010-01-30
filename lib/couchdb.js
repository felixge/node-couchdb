var
  http = require('http'),
  events = require('events'),
  querystring = require('querystring');

exports.createClient = function(port, host) {
  port = port || 5984;
  host = host || 'localhost';

  var
    httpClient = http.createClient(port, host),
    couchClient = new Client();

  couchClient.__defineGetter__('host', function() {
    return host;
  });

  couchClient.__defineGetter__('port', function() {
    return port;
  });

  couchClient._maybeDispatch = function(options) {
    if (options.query) {
      options.path += '?'+querystring.stringify(options.query);
      delete options.query;
    }

    var
      promise = new events.Promise,
      request = httpClient.request(
        options.method.toUpperCase(),
        options.path,
        options.headers
      );

    if (options.data) {
      request.sendBody(JSON.stringify(options.data), 'utf8');
    }

    request.finish(function(res) {
      var buffer = '';
      res.setBodyEncoding('utf8');
      res
        .addListener('body', function(chunk) {
          buffer += (chunk || '');
        })
        .addListener('complete', function() {
          var json;
          try {
            json = JSON.parse(buffer);
          } catch (e) {
            return promise.emitError('invalid json: '+json);
          }

          if ('error' in json) {
            return promise.emitError(json);
          }

          if (!options.full) {
            promise.emitSuccess(json);
          }

          promise.emitSuccess({
            headers: res.headers,
            json: json,
          });
        });
      
    });
    return promise;
  };

  return couchClient;
};

var Client = exports.Client = function() {

}; 

function requestOptions(method, path, data) {
  var options;

  if (typeof method == 'object') {
    options = method;
  } else if (typeof method == 'string' && typeof path != 'string') {
    options = {
      path: method,
      query: path
    };
  } else {
    options = {
      method: method,
      path: path,
      data: data
    }
  }

  return options;
}

Client.prototype.request = function(method, path, data) {
  var
    defaults = {
      method: 'get',
      path: '/',
      headers: {},
      data: null,
      query: null,
      full: false
    },
    options = requestOptions(method, path, data);

  options = process.mixin(defaults, options);
  options.headers.host = options.headers.host || this.host;

  return this._maybeDispatch(options);
};

Client.prototype.db = function(name) {
  var
    couchClient = this,
    couchDb = new Db();

  couchDb.__defineGetter__('name', function() {
    return name;
  });

  couchDb.request = function(method, path, data) {
    var options = requestOptions(method, path, data);
    options.path = '/'+name+(options.path || '');
    return couchClient.request(options);
  };

  return couchDb;
};

var Db = exports.Db = function() {
  
}; 

Db.prototype.exists = function() {
  var promise = new events.Promise();
  this
    .request('GET', '')
    .addCallback(function(r) {
      promise.emitSuccess(true);
    })
    .addErrback(function(r) {
      if (r.error == 'not_found') {
        return promise.emitSuccess(false);
      }

      promise.emitError(r);
    });

  return promise;
};

Db.prototype.info = function() {
  return this.request('GET', '');
};

Db.prototype.create = function() {
  return this.request('PUT', '');
};

Db.prototype.saveDoc = function(id, doc) {
  if (typeof id == 'object') {
    return this.request({
      method: 'POST',
      path: '/',
      data: id,
    });
  }

  return this.request({
    method: 'PUT',
    path: '/'+id,
    data: doc,
  });
};

Db.prototype.removeDoc = function(id, rev) {
  return this.request({
    method: 'DELETE',
    path: '/'+id,
    query: {rev: rev}
  });
}

Db.prototype.copyDoc = function(srcId, destId, destRev) {
  if (destRev) {
    destId += '?rev='+destRev;
  }

  return this.request({
    method: 'COPY',
    path: '/'+srcId,
    headers: {
      'Destination': destId
    }
  });
}

Db.prototype.allDocs = function(query) {
  return this.request({
    method: 'GET',
    path: '/_all_docs',
    query: query
  });
};

Db.prototype.allDocsBySeq = function(query) {
  return this.request({
    method: 'GET',
    path: '/_all_docs_by_seq',
    query: query
  });
};

Db.prototype.remove = function() {
  return this.request('DELETE', '');
};