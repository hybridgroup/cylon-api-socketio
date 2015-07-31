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
      return key;
    });

    socket.on('/', function() {
      nsp.emit('/', mcpJSON);
    });

    socket.on('robots', function() {
      nsp.emit('robots', robotsNames);
    });

    this._addDefaultListeners(socket, nspRoute, mcp);

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

  var robotName = robot.name,
      nsp = '/api/robots/' + robotName + '/devices/';

  this._socketItems(nsp, robot.devices, this._addDefaultListeners.bind(this));
};

SocketMaster.prototype._addDefaultListeners = function(sck, nspRoute, item) {
  var nspSocket = this.nsp[nspRoute];

  sck.on('commands', function() {
    this._emitList(nspSocket, 'commands', _.keys(item.commands));
  }.bind(this));

  sck.on('events', function() {
    this._emitList(nspSocket, 'events', item.events);
  }.bind(this));

  if (item.commands) {
    item.commands.loopback = function(opts) { return opts; };

    item.commands.command = function(opts) {
      return item.commands[opts.name].apply(item, opts.args);
    };
  }

  _.forIn(item.commands, function(command, cname) {
    sck.on(cname, function() {
      var data = command.apply(item, arguments);
      this._nspEmit(nspSocket, { name: cname, type: 'command', data: data });
    }.bind(this));
  }, this);

  _.forIn(item.events, function(eName) {
    if (item.listeners(eName).length < 1) {
      item.on(eName, function(data) {
        this._nspEmit(nspSocket, { name: eName, type: 'event', data: data });
        nspSocket.emit(eName, data);
      }.bind(this));
    }
  }, this);

};

SocketMaster.prototype._io = function() {
  return socketIO(this.http);
};

SocketMaster.prototype._emitList = function(socket, name, data) {
  socket.emit('message', { name: name, type: 'command', data: data });
  socket.emit(name, data);
};

SocketMaster.prototype._nspEmit = function(socket, payload) {
  socket.emit('message', payload);
  socket.emit(payload.type, { name: payload.name, data: payload.data });
};
