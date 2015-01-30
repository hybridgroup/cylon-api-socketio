"use strict";

var MockPromise = module.exports = function MockPromise() {
  this.deferred = this;
};

MockPromise.prototype.then = function(callback) {
  this.thenCallback = callback;
  return this;
};

MockPromise.prototype.catch = function(callback) {
  this.errorCallback = callback;
  return this;
};

MockPromise.prototype.resolve = function() {
  var args = arguments;

  process.nextTick(function() {
    this.thenCallback.apply(null, args);
  }.bind(this));

  return this;
};

MockPromise.prototype.reject = function() {
  var args = arguments;

  process.nextTick(function() {
    this.errorCallback.apply(null, args);
  }.bind(this));

  return this;
};
