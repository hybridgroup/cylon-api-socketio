# Cylon.js API Plugin For Socket.io

API plugins were stripped from Cylon.js main module, to make everything more modular
and at the same time make Cylon.js lighter, we now have two API plugins
for different protocols, the one in this repo `cylon-api-socketio` and
[cylon-api-http](http://github.com/hybridgroup/cylon-api-http).

Cylon.js (http://cylonjs.com) is a JavaScript framework for robotics, physical computing, and the Internet of Things using Node.js

This repository contains the Cylon API plugin for Socket.io

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
var Cylon = require('cylon');

Cylon.robot({
  name: 'rosie',

  connections: {
    arduino: { adaptor: 'firmata', port: '/dev/ttyACM0' }
  },

  devices: {
    led: { driver: 'led', pin: 13 }
  },

  events: ['turned_on', 'turned_off', 'toggle'],

  commands: function() {
    return {
      turn_on: this.turnOn,
      turn_off: this.turnOff,
      toggle: this.toggle
    };
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
    // ./**-client.html
  }
});

// ensure you install the API plugin first:
// $ npm install cylon-api-socket-io
Cylon.api(
  'socketio',{
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
    <title>Example For Robot Generic Message Event</title>
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
    var robot;

    window.onload = function() {
      console.log('Setting up socket connections:');

      // Once we have a list of available robots we can use
      // any of them and connect to their socket.
      robot = io('http://127.0.0.1:3000/api/robots/rosie');

      robot.on('message', function(payload) {
        console.log('On Robot');
        console.log('  Event:', payload.event);
        console.log('  Data:', payload.data);
        $('#messages').append($('<li>').text('On Robot:'));
        $('#messages').append($('<li>').text('event:' + payload.event.toString()));
        if (!!payload.data) {
          $('#messages').append($('<li>').text('data:' + payload.data.toString()));
        }
        $('#messages').append($('<hr />'));
      });

      setTimeout(function() {
        robot.emit('toggle');
      }, 5000);

      robot.emit('commands');
      robot.emit('events');
      robot.emit('turn_on');

      msg = 'You have been subscribed to Cylon sockets:' + robot.nsp;

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

* All patches must be provided under the Apache 2.0 License
* Please use the -s option in git to "sign off" that the commit is your work and you are providing it under the Apache 2.0 License
* Submit a Github Pull Request to the appropriate branch and ideally discuss the changes with us in IRC.
* We will look at the patch, test it out, and give you feedback.
* Avoid doing minor whitespace changes, renamings, etc. along with merged content. These will be done by the maintainers from time to time but they can complicate merges and should be done seperately.
* Take care to maintain the existing coding style.
* Add unit tests for any new or changed functionality & lint and test your code using `make test` and `make lint`.
* All pull requests should be "fast forward"
  * If there are commits after yours use “git rebase -i <new_head_branch>”
  * If you have local changes you may need to use “git stash”
  * For git help see [progit](http://git-scm.com/book) which is an awesome (and free) book on git

## Release History

0.2.4 - Fix issue with npm module release

0.2.3 - Changes for latest Cylon release v0.22.1

0.2.2 - Fixes api.server.listen undefined issue

0.2.1 - Update examples to fix an issue with CORS

0.2.0 - Add support for robot commands and events

0.1.0 - Initial release

## License

Copyright (c) 2014-2015 The Hybrid Group. Licensed under the Apache 2.0 license.
