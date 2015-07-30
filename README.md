# Cylon.js API Plugin For Socket.io

Cylon.js (http://cylonjs.com) is a JavaScript framework for robotics, physical computing, and the Internet of Things using Node.js

API plugins are separate from the Cylon.js main module, to make everything more modular
and at the same time make Cylon.js lighter.

This repository contains the Cylon API plugin for [Socket.io](http://socket.io/)

For more information about Cylon, check out the repo at
https://github.com/hybridgroup/cylon

[![Build Status](https://travis-ci.org/hybridgroup/cylon-api-socketio.svg)](https://travis-ci.org/hybridgroup/cylon-api-socketio)
[![Code Climate](https://codeclimate.com/github/hybridgroup/cylon-api-socketio/badges/gpa.svg)](https://codeclimate.com/github/hybridgroup/cylon-api-socketio)
[![Test Coverage](https://codeclimate.com/github/hybridgroup/cylon-api-socketio/badges/coverage.svg)](https://codeclimate.com/github/hybridgroup/cylon-api-socketio)

## How to Install

```bash
$ npm install cylon cylon-api-socketio
```

## How to Use

Make sure you have Cylon.js installed, then we can add Socket.io support to cylon
programs as follows:

```javascript
'use strict';

var Cylon = require('cylon');

Cylon.robot({
  name: 'rosie',

  connections: {
    arduino: { adaptor: 'firmata', port: '/dev/ttyACM0' }
  },

  devices: {
    led: { driver: 'led', pin: 13 }
  },

  work: function() {
    // for this example with sockets
    // we are going to be interacting
    // with the robot using the code in
    // ./**-client.html
  }
});

// ensure you install the API plugin first:
// $ npm install cylon-api-socket-io
Cylon.api('socketio',
{
  host: '0.0.0.0',
  port: '3000'
});

Cylon.start();
```

## How to Connect

Once you have added the api to your Cylon.js code, and your robots are up and running, you can connect to them using Socket.io using the following code:

```html
<!doctype html>
<html>
  <meta charset="utf-8">
  <head>
    <title>Simple Device Example</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font: 13px Helvetica, Arial; }
      form { background: #000; padding: 3px; position: fixed; bottom: 0; width: 100%; }
      form input { border: 0; padding: 10px; width: 90%; margin-right: .5%; }
      form button { width: 9%; background: rgb(130, 224, 255); border: none; padding: 10px; }
      #messages { list-style-type: none; margin: 0; padding: 0; }
      #messages li { padding: 5px 10px; }
      #messages li:nth-child(odd) { background: #eee; }
    </style>
  </head>
  <script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
  <script src="http://code.jquery.com/jquery-1.11.1.js"></script>
  <script type="text/javascript">
    var device;

    window.onload = function() {
      console.log('Setting up socket connections:');

      // We use the robot nsp (namespace) to connect to one of the devices
      // in this case the led we added in our cylon robot code
      device = io('http://127.0.0.1:3000/api/robots/rosie/devices/led');
      setInterval(function() {
        // There are two ways to send commands to a device,
        // The first one (we preffer this one) is by emitting
        // an event using the name of the command for the event,
        // and passing the params as regular function args.
        // eg. device.emit('angle', 180[, param2, param3, ...]);
        device.emit('toggle');

        /*
        // In the second one you emit a 'command' event and
        // pass the command specifics inside an object.
        device.emit(
          'command',
          {
            name: 'angle',
            args: [180, 'arg2', 'arg3']
          }
        );'
        */
      }, 1000);

      device.on('message', function(payload) {
        console.log('On Device');
        console.log('  Event:', payload.event);
        console.log('  Data:', payload.data);
        $('#messages').append($('<li>').text('On Device:'));
        $('#messages').append($('<li>').text('  Event:' + payload.event.toString()));
        if (!!payload.data) {
          $('#messages').append($('<li>').text('  Data:' + payload.data.toString()));
        }
        $('#messages').append($('<hr />'));
      });

      msg = 'You have been subscribed to Cylon sockets:' + device.nsp;

      $('#messages').append($('<li>').text(msg));
    };
  </script>
  <body>
    <ul id="messages"></ul>
  </body>
</html>
```

## Documentation

We're busy adding documentation to [cylonjs.com](http://cylonjs.com). Please check there as we continue to work on Cylon.js.

Thank you!

## Contributing

For our contribution guidelines, please go to [https://github.com/hybridgroup/cylon/blob/master/CONTRIBUTING.md](https://github.com/hybridgroup/cylon/blob/master/CONTRIBUTING.md).

## Release History

For the release history, please go to [https://github.com/hybridgroup/cylon-api-socketio/blob/master/RELEASES.md](https://github.com/hybridgroup/cylon-api-socketio/blob/master/RELEASES.md).

## License

Copyright (c) 2014-2015 The Hybrid Group. Licensed under the Apache 2.0 license.
