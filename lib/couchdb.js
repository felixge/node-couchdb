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
      throw new Error('not implemented yet');
    }

    request.finish(function(res) {
      var buffer = '';
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

Client.prototype.request = function(method, path, data) {
  var
    defaults = {
      method: 'get',
      path: '/',
      headers: {},
      data: {},
      query: {},
      full: false
    },
    options;

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

  options = process.mixin(defaults, options);
  options.headers.host = options.headers.host || this.host;

  return this._maybeDispatch(options);
};