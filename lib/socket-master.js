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
    var nspAndName;

    name = name.toLowerCase();
    nspAndName = nsp + name;

    if (!this.nsp[nspAndName]) {
      console.log('Creating new socket for: ' + nspAndName);

      this.nsp[nspAndName] = this.io.of(nspAndName);

      this.nsp[nspAndName].on('connection', function(socket) {
        console.log('User connected to socket: ', nspAndName);

        socket.on('disconnect', function() {
          console.log('User disconnected from socket: ', nspAndName);
        });

        callback(socket, nspAndName, item);
      });
    }
  }, this);
};

SocketMaster.prototype.socketMCP = function() {
  console.log('Setting up API socket...');

  var callback = function(socket, nspRoute, mcp) {
    var mcpJSON = mcp.toJSON(),
        nsp = this.nsp[nspRoute];

    var robotsNames = _.map(mcp.robots, function(val, key) {
      return key.toLowerCase();
    });

    socket.on('/', function() {
      nsp.emit('/', mcpJSON);
    });

    socket.on('robots', function() {
      nsp.emit('robots', robotsNames);
    });

    nsp.emit('/', mcpJSON);
  }.bind(this);

  this._socketItems('/api', { '': this.mcp }, callback);
};

SocketMaster.prototype.socketRobots = function(robots) {
  console.log('Setting up robot sockets...');

  var callback = function(socket, nspRoute, robot) {
    var devices = _.keys(robot.devices);

    socket.on('devices', function() {
      this.nsp[nspRoute].emit('devices', devices);
    }.bind(this));

    this._addDefaultListeners(socket, nspRoute, robot);

    this.nsp[nspRoute].emit('devices', devices);
  }.bind(this);

  this._socketItems('/api/robots/', robots, callback);
};

SocketMaster.prototype.socketDevices = function(robot) {
  console.log('Setting up device sockets...');

  var robotName = robot.name.toLowerCase(),
      nsp = '/api/robots/' + robotName + '/devices/';

  this._socketItems(nsp, robot.devices, this._addDefaultListeners.bind(this));
};

SocketMaster.prototype._addDefaultListeners = function(sck, nspRoute, item) {

  sck.on('message', function(data) {
    var nspSocket = this.nsp[nspRoute];

    this._nspEmit(nspSocket, 'message', data);
  }.bind(this));

  sck.on('commands', function() {
    var commands = _.keys(item.commands),
        nspSocket = this.nsp[nspRoute];

    this._nspEmit(nspSocket, 'commands', commands);
  }.bind(this));

  sck.on('events', function() {
    var events = item.events,
        nspSocket = this.nsp[nspRoute];

    this._nspEmit(nspSocket, 'events', events);
  }.bind(this));

  sck.on('command', function(opts) {
    var ret = item.commands[opts.command].apply(item, opts.args),
        ns = this.nsp[nspRoute];

    this._nspEmit(ns, 'command', { command: opts.command, returned: ret });
  }.bind(this));

  _.forIn(item.commands, function(command, cname) {
    sck.on(cname, function() {
      var ret = command.apply(item, arguments),
          nspSocket = this.nsp[nspRoute];

      this._nspEmit(nspSocket, cname, ret);
    }.bind(this));
  }, this);

  _.forIn(item.events, function(eventName) {
    if (item.listeners(eventName).length < 1) {
      item.on(eventName, function(data) {
        var args = _.toArray(arguments),
        nspSocket = this.nsp[nspRoute];

        nspSocket.emit('message', this._msgPayload(eventName, data));
        nspSocket.emit.apply(nspSocket, [eventName].concat(args));
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

SocketMaster.prototype._nspEmit = function(nspSocket, eventName, data) {
  nspSocket.emit('message', this._msgPayload(eventName, data));
  nspSocket.emit(eventName, data);
};
