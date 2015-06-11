'use strict';

// A mock version of the http.ClientRequest class
module.exports = function MockRequest(opts) {
  if (opts == null) {
    opts = {};
  }

  this.url = '/';

  this.headers = {};

  for (var opt in opts) {
    this[opt] = opts[opt];
  }
};
