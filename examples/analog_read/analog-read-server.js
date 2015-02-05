'use strict';

var Cylon = require('cylon');

Cylon.robot({
  name: 'rosie',

  connections: {
    arduino: { adaptor: 'firmata', port: '/dev/ttyACM0' }
  },

  devices: {
    asensor: { driver: 'analog-sensor', pin: 0 }
  },

  work: function() {
    // Add your robot code here,
    // for this example with sockets
    // we are going to be interacting
    // with the robot using the code in
    // ./analog-read-client.html.

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
