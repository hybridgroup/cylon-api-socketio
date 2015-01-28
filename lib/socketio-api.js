/*
 * Cylon API
 * cylonjs.com
 *
 * Copyright (c) 2013-2015 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

"use strict";

var express = require("express"),
    _ = require("lodash"),
    SocketMaster = require('./socket-master.js');

var API = module.exports = function API(opts) {
  if (opts == null) {
    opts = {};
  }

  this.mcp = opts.mcp;
  this.host = opts.host;
  this.port = opts.port;

  _.forEach(this.defaults, function(def, name) {
    this[name] = _.has(opts, name) ? opts[name] : def;
  }, this);

  console.log("Socket.io server created.");
  this.createServer();

  this.express.set("title", "Cylon Socket.io API Server");

  this.express.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

  // error handling
  this.express.use(function(err, req, res, next) {
    res.status(500).json({ error: err.message || "An error occured."});
    next();
  });
};

API.prototype.defaults = {
  host: "127.0.0.1",
  port: "3000",
};

API.prototype.createServer = function createServer() {
  this.express = express();
  this.server = this.http = require('http').Server(this.express);
  this.sm = new SocketMaster(this.http, this.mcp);
};

API.prototype.listen = function() {
  this.server.listen(this.port, function() {
    var title = this.express.get("title"),
        str;

    str = "Listening " + title + " @" + this.host + ":" + this.port;

    console.log("Cylon + Socket.io is now online.");
    console.log(str);
  }.bind(this));
};
