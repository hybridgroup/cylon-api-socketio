'use strict';

var Cylon = require('cylon');

Cylon.robot({
  name: 'rosie',

  events: ['turned_on', 'turned_off', 'toggle'],

  connections: {
    arduino: { adaptor: 'firmata', port: '/dev/ttyACM0' }
  },

  devices: {
    led: { driver: 'led', pin: 13 }
  },

  toggle: function() {
    this.led.toggle();
    if (this.led.isOn()) {
      this.emit('turned_on', { data: 'pass some data to the listener'});
    } else {
      this.emit('turned_off', { data: 'pass some data to the listener'});
    }
  },

  turnOn: function() {
    this.led.turnOn();
    this.emit('turned_on', { data: 'pass some data to the listener'});
  },

  turnOff: function() {
    this.led.turnOff();
    this.emit('turned_off', { data: 'pass some data to the listener'});
  },

  work: function() {
    // Add your robot code here,
    // for this example with sockets
    // we are going to be interacting
    // with the robot using the code in
    // ./blink-client.html.
  }
});

// ensure you install the API plugin first:
// $ npm install cylon-api-socket-io
Cylon.api(
  'socketio', {
  host: '0.0.0.0',
  port: '3000'
});

Cylon.start();
