/*
 * Cylon API
 * cylonjs.commap
 * Copyright (c) 2013-2015 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

"use strict";

var socketIO = require("socket.io"),
    _ = require("lodash");

var SocketMaster = module.exports = function SocketMaster(http, mcp) {
  this.io = socketIO(http);
  this.mcp = mcp;
  this.nsp = {};
  this.connect();
};

SocketMaster.prototype.connect = function() {
  this.io.on('connection', function(socket) {
    console.log('A user connected');

    socket.on('disconnect', function() {
      console.log('A user disconnected');
    });

    socket.on('/message', function(msg) {
      this.io.emit('/message', msg);
    }.bind(this));

    //this.socketMCP();
  }.bind(this));

  this.socketMCP();
  this.socketRobots(this.mcp.robots);
  _.forIn(this.mcp.robots, function(robot) {
    this.socketDevices(robot);
  }, this);
};

SocketMaster.prototype._socketItems = function(nsp, items, callback) {
  console.log('Setting up items sockets...');
  _.forIn(items, function(item, name) {
    var nspName;

    name = name.toLowerCase();
    nspName = nsp + name;

    if (!this.nsp[name]) {
      console.log('Creating new socket for: ' + nspName);

      this.nsp[name] = this.io.of(nspName);

      this.nsp[name].on('connection', function(socket) {
        console.log('Connected to socket: ', nspName);

        socket.on('disconnect', function() {
          console.log('disconnected from socket: ', nspName);
        });

        callback(socket, name, item);
      }.bind(this));
    }
  }, this);
};

SocketMaster.prototype.socketMCP = function() {
  console.log('Setting up API socket...');

  var callback = function(socket, name, robots) {
    var robotNames = _.map(robots, function(val, key) {
      return key.toLowerCase();
    });

    socket.on('robots', function() {
      this.nsp[name].emit('robots', robotNames);
    }.bind(this));

    this.nsp[name].emit('robots', robotNames);
    //this.socketRobots(this.mcp.robots);
  }.bind(this);

  this._socketItems('/api/', { robots: this.mcp.robots }, callback);
};

SocketMaster.prototype.socketRobots = function(robots) {
  console.log('Setting up robot sockets...');

  var callback = function(socket, name, robot) {
    socket.on('devices', function() {
      var devices = _.keys(robot.devices);
      this.nsp[name].emit('devices', devices);
    }.bind(this));

    socket.on('message', function(msg) {
      this.nsp[name].emit('message', msg);
    }.bind(this));

    //this.socketDevices(robot);
  }.bind(this);

  this._socketItems('/api/robots/', robots, callback);
};

SocketMaster.prototype.socketDevices = function(robot) {
  console.log('Setting up device sockets...');

  var callback = function(socket, name, device) {
    socket.on('message', function(msg) {
      this.nsp[name].emit('message', msg);
    }.bind(this));

    socket.on('commands', function() {
      var commands = _.keys(device.commands);
      this.nsp[name].emit('commands', commands);
    }.bind(this));

    socket.on('events', function() {
      var events = device.events;
      this.nsp[name].emit('events', events);
    }.bind(this));

    socket.on('command', function(opts) {
      var ret = device.commands[opts.command].apply(device, opts.args);
      this.nsp[name].emit('command', opts.command, ret);
    }.bind(this));

    _.forIn(device.commands, function(command, cname) {
      socket.on(cname, function() {
        var ret = command.apply(device, arguments);
        this.nsp[name].emit(cname, ret);
      }.bind(this));
    }, this);

  }.bind(this);

  var robotName = robot.name.toLowerCase(),
      nsp = '/api/robots/' + robotName + '/devices/';

  this._socketItems(nsp, robot.devices, callback);
};
