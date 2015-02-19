'use strict';

var Cylon = require('cylon');

Cylon.robot({
  name: 'cybot',

  // These are the events that will be registered in the API
  events: ['turned_on', 'turned_off'],

  // These are the commands that will be availble in the API
  // Commands method needs to return an object with the aliases
  // to the robot methods.
  commands: function() {
    return {
      turn_on: this.turnOn,
      turn_off: this.turnOff,
      toggle: this.toggle
    };
  },

  connections: {
    arduino: { adaptor: 'firmata', port: '/dev/ttyACM0' }
  },

  devices: {
    led: { driver: 'led', pin: 13 }
  },

  work: function() {
    // Add your robot code here,
    // for this example with sockets
    // we are going to be interacting
    // with the robot using the code in
    // ./analog-read-client.html.
    after((2).seconds(), function() {
      this.turnOn();
    }.bind(this));

    after((5).seconds(), function() {
      this.turnOff();
    }.bind(this));
  },

  turnOn: function() {
    this.led.turnOn();
    this.emit('turned_on', { data: 'pass some data to the listener'});
  },

  turnOff: function() {
    this.led.turnOff();
    this.emit('turned_off', { data: 'pass some data to the listener'});
  },

  toggle: function() {
    this.led.toggle();
    if (this.led.isOn()) {
      this.emit('turned_on', { data: 'pass some data to the listener'});
    } else {
      this.emit('turned_off', { data: 'pass some data to the listener'});
    }
  }
});

// ensure you install the API plugin first:
// $ npm install cylon-api-socket-io
Cylon.api(
  'socketio',
  {
  host: '0.0.0.0',
  port: '3000'
});

Cylon.start();
