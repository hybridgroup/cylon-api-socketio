/*
 * Cylon API
 * cylonjs.commap
 * Copyright (c) 2013-2015 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

'use strict';

var socketIO = require('socket.io'),
    _ = require('lodash');

var SocketMaster = module.exports = function SocketMaster(http, mcp) {
  this.http = http;
  this.mcp = mcp;
  this.io = {};
  this.nsp = {};
};

SocketMaster.prototype.start = function() {
  this.io = this._io();

  this.io.on('connection', function(socket) {
    console.log('A user connected');

    socket.on('disconnect', function() {
      console.log('A user disconnected');
    });

    this.socketMCP();
    this.socketRobots(this.mcp.robots);

    _.forIn(this.mcp.robots, function(robot) {
      this.socketDevices(robot);
    }, this);
  }.bind(this));
};

SocketMaster.prototype._socketItems = function(nsp, items, callback) {
  _.forIn(items, function(item, name) {
    var nspName;

    name = name.toLowerCase();
    nspName = nsp + name;

    if (!this.nsp[name]) {
      console.log('Creating new socket for: ' + nspName);

      this.nsp[name] = this.io.of(nspName);

      this.nsp[name].on('connection', function(socket) {
        console.log('User connected to socket: ', nspName);

        socket.on('disconnect', function() {
          console.log('User disconnected from socket: ', nspName);
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
  }.bind(this);

  this._socketItems('/api/', { robots: this.mcp.robots }, callback);
};

SocketMaster.prototype.socketRobots = function(robots) {
  console.log('Setting up robot sockets...');

  var callback = function(socket, name, robot) {
    var devices = _.keys(robot.devices);

    socket.on('devices', function() {
      this.nsp[name].emit('devices', devices);
    }.bind(this));

    this._addDefaultListeners(socket, name, robot);

    this.nsp[name].emit('devices', devices);
  }.bind(this);

  this._socketItems('/api/robots/', robots, callback);
};

SocketMaster.prototype.socketDevices = function(robot) {
  console.log('Setting up device sockets...');

  var robotName = robot.name.toLowerCase(),
      nsp = '/api/robots/' + robotName + '/devices/';

  this._socketItems(nsp, robot.devices, this._addDefaultListeners.bind(this));
};

SocketMaster.prototype._addDefaultListeners = function(socket, name, item) {

  socket.on('message', function(data) {
    var nsp = this.nsp[name];

    this._nspEmit(nsp, 'message', data);
  }.bind(this));

  socket.on('commands', function() {
    var commands = _.keys(item.commands),
        nsp = this.nsp[name];

    this._nspEmit(nsp, 'commands', commands);
  }.bind(this));

  socket.on('events', function() {
    var events = item.events,
        nsp = this.nsp[name];

    this._nspEmit(nsp, 'events', events);
  }.bind(this));

  socket.on('command', function(opts) {
    var ret = item.commands[opts.command].apply(item, opts.args),
        nsp = this.nsp[name];

    this._nspEmit(nsp, 'command', { command: opts.command, returned: ret });
  }.bind(this));

  _.forIn(item.commands, function(command, cname) {
    socket.on(cname, function() {
      var ret = command.apply(item, arguments),
          nsp = this.nsp[name];

      this._nspEmit(nsp, cname, ret);
    }.bind(this));
  }, this);

  _.forIn(item.events, function(eventName) {
    if (item.listeners(eventName).length < 1) {
      item.on(eventName, function(data) {
        var args = _.toArray(arguments),
        nsp = this.nsp[name];

        nsp.emit('message', this._msgPayload(eventName, data));
        nsp.emit.apply(nsp, [eventName].concat(args));
      }.bind(this));
    }
  }, this);

};

SocketMaster.prototype._io = function() {
  return socketIO(this.http);
};

SocketMaster.prototype._msgPayload = function(eventName, data) {
  return {
    event: eventName,
    data: data
  };
};

SocketMaster.prototype._nspEmit = function(nsp, eventName, data) {
  nsp.emit('message', this._msgPayload(eventName, data));
  nsp.emit(eventName, data);
};
