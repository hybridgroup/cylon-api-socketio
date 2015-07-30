'use strict';

var SocketMaster = lib('socket-master');

describe('SocketMaster', function() {
  var sm, mcp;

  beforeEach(function() {
    mcp = {
      toJSON: spy(),
      robots: {
        rosie: {
          name: 'rosie',
          devices: {
            led: {
              commands: {
                turn_on: function() { return 1; }
              },
              events: ['turn_on'],
              listeners: function() { return []; }
            }
          },
          commands: {
            turn_on: function() { return 1; }
          }
        },
        thelma: {
          devices: {
            asensor: {
              commands: {
                turn_on: function() {}
              },
              events: ['analogRead']
            }
          },
          commands: {
            turn_on: function() { return 1; }
          }
        }
      }
    };
    sm = new SocketMaster({}, mcp);
    stub(console, 'log');
  });

  afterEach(function() {
    console.log.restore();
  });

  describe('#constructor', function() {
    it('sets @http', function() {
      expect(sm.http).to.be.eql({});
    });

    it('sets @io', function() {
      expect(sm.io).to.be.eql({});
    });

    it('sets @mcp', function() {
      expect(sm.mcp).to.be.eql(mcp);
    });

    it('sets @nsp', function() {
      expect(sm.nsp).to.be.eql({});
    });
  });

  describe('#start', function() {
    var io, socket;

    beforeEach(function() {
      io = {
        on: stub()
      };

      socket = {
        on: stub()
      };

      io.on.yields(socket);
      socket.on.yields();

      stub(sm, '_io').returns(io);
      stub(sm, 'socketMCP').returns(io);
      stub(sm, 'socketRobots').returns(io);
      stub(sm, 'socketDevices').returns(io);

      sm.start();
    });

    afterEach(function() {
      sm._io.restore();
      sm.socketMCP.restore();
      sm.socketRobots.restore();
      sm.socketDevices.restore();
    });

    it('calls #_io', function() {
      expect(sm._io).to.be.calledOnce;
    });

    it('sets #io', function() {
      expect(sm.io).to.be.eql(io);
    });

    it('sets listener for #io#on "connection"', function() {
      expect(sm.io.on).to.be.calledWith('connection');
    });

    it('sets listeners for #socket#on "disconnect"', function() {
      expect(socket.on).to.be.calledWith('disconnect');
    });

    it('sets listeners for #socket#on "disconnect"', function() {
      expect(console.log).to.be.calledWith('A user disconnected');
    });

    it('calls  #socketMCP', function() {
      expect(sm.socketMCP).to.be.calledOnce;
    });

    it('calls  #socketRobots', function() {
      expect(sm.socketRobots).to.be.calledOnce;
      expect(sm.socketRobots).to.be.calledWith(mcp.robots);
    });

    it('calls  #socketDevices', function() {
      expect(sm.socketDevices).to.be.calledTwice;
      expect(sm.socketDevices).to.be.calledWith(mcp.robots.rosie);
      expect(sm.socketDevices).to.be.calledWith(mcp.robots.thelma);
    });
  });

  describe('#_socketItems', function() {
    var callback, nsp, socket;

    beforeEach(function() {
      socket = {
        on: stub()
      };

      nsp = {
        on: stub()
      };

      socket.on.yields();
      nsp.on.yields(socket);

      callback = spy();
      sm.io.of = stub();
      sm.io.of.returns(nsp);

      sm._socketItems('/api/robots/', mcp.robots, callback);
    });

    it('calls #io#of once per robot', function() {
      expect(sm.io.of).to.be.calledWith('/api/robots/rosie');
      expect(sm.io.of).to.be.calledWith('/api/robots/thelma');
    });

    it('sets nsps for all robots', function() {
      expect(sm.nsp['/api/robots/rosie']).to.be.eql(nsp);
      expect(sm.nsp['/api/robots/thelma']).to.be.eql(nsp);
    });

    it('sets listeners for "connection" event on nsps', function() {
      expect(sm.nsp['/api/robots/rosie'].on).to.be.calledWith('connection');
      expect(sm.nsp['/api/robots/thelma'].on).to.be.calledWith('connection');
    });

    it('sets listeners for socket "disconnect" event', function() {
      expect(socket.on).to.be.calledWith('disconnect');
    });

    it('triggers the callback', function() {
      expect(callback).to.be.calledWith(
          socket, '/api/robots/rosie', mcp.robots.rosie);
      expect(callback).to.be.calledWith(
          socket, '/api/robots/thelma', mcp.robots.thelma);
    });
  });

  describe('#socketMCP', function() {
    var socket;

    beforeEach(function() {
      socket = {
        on: stub()
      };

      socket.on.yields();

      stub(sm, '_socketItems');

      sm.nsp = {
        '/': {
          emit: stub()
        },
        '/api': {
          emit: stub()
        },
        '/api/robots': {
          emit: stub()
        }
      };

      sm._socketItems.yields(socket, '/api', mcp);

      sm.socketMCP();
    });

    afterEach(function() {
      sm._socketItems.restore();
    });

    it('calls #_socketItems', function() {
      expect(sm._socketItems).to.be.calledWith(
        '/api',
        { '': mcp }
      );
    });

    it('adds a listener for robots to the socket', function() {
      expect(socket.on).to.be.calledWith('robots');
    });

    it('emits "/" event with params', function() {
      expect(sm.nsp['/api'].emit).to.be.calledWith('/');
      expect(sm.nsp['/api'].emit).to.be.calledWith('robots');
    });
  });

  describe('#socketRobots', function() {
    var socket;

    beforeEach(function() {
      socket = {
        on: stub()
      };

      socket.on.yields({ name: 'turn_on', args: [] });
      stub(sm, '_socketItems');
      spy(sm, '_addDefaultListeners');

      sm.nsp = {
        '/api/robots/rosie': {
          emit: stub()
        },
        '/api/robots/thelma': {
          emit: stub()
        }
      };

      sm._socketItems.yields(socket, '/api/robots/rosie', mcp.robots.rosie);

      sm.socketRobots(mcp.robots);
    });

    afterEach(function() {
      sm._socketItems.restore();
      sm._addDefaultListeners.restore();
    });

    it('calls #_socketItems', function() {
      expect(sm._socketItems).to.be.calledWith(
        '/api/robots/',
        mcp.robots
      );
    });

    it('adds a listener for "devices" to the socket', function() {
      expect(socket.on).to.be.calledWith('devices');
    });

    it('calls #_addDefaultListeners', function() {
      expect(sm._addDefaultListeners).to.be.calledOnce;
      expect(sm._addDefaultListeners).to.be.calledWith(
        socket,
        '/api/robots/rosie'
      );
    });
  });

  describe('#socketDevices', function() {
    var socket, led;

    beforeEach(function() {
      socket = {
        on: stub()
      };

      socket.on.yields({ name: 'turn_on', args: [] });

      stub(sm, '_socketItems');
      spy(sm, '_addDefaultListeners');

      sm.nsp = {
        '/api': {
          emit: stub()
        },
        '/api/robots/rosie': {
          emit: stub()
        },
        '/api/robots/rosie/devices/led': {
          emit: stub()
        },
      };

      led = mcp.robots.rosie.devices.led;
      led.on = stub();
      led.on.yields();

      sm._socketItems.yields(
        socket,
        '/api/robots/rosie/devices/led',
        mcp.robots.rosie.devices.led
      );

      sm.socketDevices(mcp.robots.rosie);
    });

    afterEach(function() {
      sm._socketItems.restore();
      sm._addDefaultListeners.restore();
    });

    it('calls #_socketItems', function() {
      expect(sm._socketItems).to.be.calledWith(
        '/api/robots/rosie/devices/',
        mcp.robots.rosie.devices
      );
    });

    it('adds a listener for "loopback" to the socket', function() {
      expect(socket.on).to.be.calledWith('loopback');
    });

    it('emits "message" event', function() {
      var route = '/api/robots/rosie/devices/led';
      expect(sm.nsp[route].emit).to.be.calledWith('message');
    });

    it('adds a listener for "commands" to the socket', function() {
      expect(socket.on).to.be.calledWith('commands');
    });

    it('emits "commands" event', function() {
      var route = '/api/robots/rosie/devices/led';
      expect(sm.nsp[route].emit).to.be.calledWith(
        'commands',
        ['turn_on']
      );
    });

    it('adds a listener for "events" to the socket', function() {
      expect(socket.on).to.be.calledWith('events');
    });

    it('emits "events" event', function() {
      var route = '/api/robots/rosie/devices/led';
      expect(sm.nsp[route].emit).to.be.calledWith(
        'events',
        mcp.robots.rosie.devices.led.events
      );
    });

    it('adds a listener for "command" to the socket', function() {
      expect(socket.on).to.be.calledWith('command');
    });

    it('emits "command" event with (command, turn_on, 1)', function() {
      var route = '/api/robots/rosie/devices/led';
      expect(sm.nsp[route].emit).to.be.calledWith(
        'command',
        { name: 'turn_on', data: 1 }
      );
    });

    it('adds a listener for "turn_on" to the socket', function() {
      expect(socket.on).to.be.calledWith('turn_on');
    });

    it('adds a listener for "turn_on" to the device', function() {
      expect(led.on).to.be.calledWith('turn_on');
    });

    it('calls #_addDefaultListeners', function() {
      expect(sm._addDefaultListeners).to.be.calledOnce;
      expect(sm._addDefaultListeners).to.be.calledWith(
        socket,
        '/api/robots/rosie/devices/led'
      );
    });
  });
});
