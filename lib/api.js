/*
 * Cylon API
 * cylonjs.com
 *
 * Copyright (c) 2013-2015 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

'use strict';

var express = require('express'),
    http = require('http'),
    _ = require('lodash'),
    SocketMaster = require('./socket-master.js');

var API = module.exports = function(opts) {
  if (opts == null) {
    opts = {};
  }

  this.mcp = opts.mcp;

  _.forEach(this.defaults, function(def, name) {
    this[name] = _.has(opts, name) ? opts[name] : def;
  }, this);
};

API.prototype.defaults = {
  name: 'socketio',
  host: '127.0.0.1',
  port: '3000',
  auth: false,
  CORS: '*:*',
};

API.prototype.start = function() {
  this.createServer();
  this.listen();
};

API.prototype.createServer = function createServer() {
  this.express = this._express();
  this.server = this.http = this._http();
  this.sm = this._newSM();
  this.sm.start();

  // set CORS headers for API requests
  this.sm.io.set( 'origins', this.CORS || '*:*' );

  this.express.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', this.CORS || '*:*');
    res.header('Access-Control-Allow-Headers',
               'Origin, Authorization, X-Requested-With, Content-Type, Accept');
    next();
  }.bind(this));

  this.express.set('title', 'Cylon Socket.io API Server');

  this.express.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

  // error handling
  this.express.use(function(err, req, res, next) {
    res.status(500);
    res.json({ error: err.message || 'An error occured.' });
    next();
  });
};

API.prototype.listen = function() {
  this.server.listen(this.port, function() {
    var title = this.express.get('title'),
        str;

    str = 'Listening ' + title + ' @' + this.host + ':' + this.port;

    console.log('Cylon + Socket.io is now online.');
    console.log(str);

  }.bind(this));
};

API.prototype._newSM = function() {
  return new SocketMaster(this.http, this.mcp);
};

API.prototype._express = function() {
  return express();
};

API.prototype._http = function() {
  return http.Server(this.express);
};
