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
  //_.forIn(this.mcp.robots, function(robot, name) {
    //this.socketDevices(robot.devices, name);
  //}, this);
};

SocketMaster.prototype.connect = function() {
  this.io.on('connection', function(socket) {
    console.log('A user connected');

    socket.on('disconnect', function() {
      console.log('A user disconnected');
    });

    socket.on('/message', function(msg) {
      this.io.emit('/mcp/message', msg);
    }.bind(this));

    this.socketMCP();
  }.bind(this));
};

SocketMaster.prototype.socketMCP = function() {
  if (!this.nsp.robots) {
    this.nsp.robots = this.io.of('/api/robots');

    this.nsp.robots.on('connection', function(socket) {
      console.log('Connected to Cylon.JS sockets');

      socket.on('disconnect', function() {
        console.log('User disconnected from Cylon.JS sockets');
      });

      socket.on('robots', function() {
        var robots = _.map(this.mcp.robots, function(val, key) {
          return key.toLowerCase();
        });
        this.nsp.robots.emit('robots', robots);
      }.bind(this));

      this.socketRobots(this.mcp.robots);
    }.bind(this));
  }
};

SocketMaster.prototype.socketRobots = function(robots) {
  console.log('Setting up robots sockets...');
  _.forIn(robots, function(robot, name) {
    name = name.toLowerCase();

    if (!this.nsp[name]) {
      console.log('Creating new socket for robot: ' + name);

      this.nsp[name] = this.io.of('/api/robots/' + name);

      this.nsp[name].on('connection', function(socket) {
        console.log('connected to robot socket: /', name);

        socket.on('disconnect', function() {
          console.log('disconnected from robot socket: /', name);
        });

        socket.on('devices', function() {
          var devices = _.keys(robot.devices);
          this.nsp[name].emit('devices', devices);
        }.bind(this));

        socket.on('message', function(msg) {
          this.nsp[name].emit('message', msg);
        }.bind(this));

        this.socketDevices(robot.devices);
      }.bind(this));
    }
  }, this);
};

SocketMaster.prototype.socketDevices = function(devices) {
  console.log('Setting up device sockets...');
  _.forIn(devices, function(device, name) {
    var robotName = device.robot.name.toLowerCase(),
        nspName = '/api/robots/' + robotName + '/devices/' + name;

    name = name.toLowerCase();

    if (!this.nsp[name]) {

      console.log(
        'Creating new socket for device:' +
         device.name +
        ' inside robot:' + robotName);

      this.nsp[name] = this.io.of(nspName);

      this.nsp[name].on('connection', function(socket) {
        console.log('connected to device socket: /', name);

        socket.on('disconnect', function() {
          console.log('disconnected from device: /', name);
        });

        socket.on('message', function(msg) {
          this.nsp[name].emit('message', msg);
        }.bind(this));
      }.bind(this));
    }
  }, this);
};
