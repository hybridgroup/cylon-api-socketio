'use strict';

// A mock version of http.ServerResponse to be used in tests
module.exports = function MockResponse() {
  this.end = spy();

  this.headers = {};
  this.setHeader = function setHeader(name, value) {
    this.headers[name] = value;
  };
};
