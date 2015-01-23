/*
 * Cylon API
 * cylonjs.com
 *
 * Copyright (c) 2013-2015 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

"use strict";

var express = require("express"),
    _ = require("lodash");

var API = module.exports = function API(opts) {
  if (opts == null) {
    opts = {};
  }

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

  // set Cylon/MCP in request
  this.express.use(function(req, res, next) {
    req.mcp = opts.mcp;
    return next();
  });

  // load route definitions
  //this.express.use("/api", require("./api/routes"));

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
  this.http = require('http').Server(this.express);
  this.server = this.http;
  this.io = require("socket.io")(this.http);
};

API.prototype.listen = function() {
  console.log("Listenning on connection!!!!.");

  this.io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('disconnect', function() {
      console.log('user disconnected');
    });

    socket.on('chat message', function(msg) {
      console.log('msg: ', msg);
      this.io.emit('chat message', msg);
    }.bind(this));
  }.bind(this));

  this.server.listen(this.port, function() {
    var title = this.express.get("title"),
        str;

    str = "Listening " + title + " @" + this.host + ":" + this.port;

    console.log("Cylon + Socket.io is now online.");
    console.log(str);
  }.bind(this));
};
