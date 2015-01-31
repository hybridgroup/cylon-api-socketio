 /* jshint expr:true */
"use strict";

var SocketMaster = source('socket-master');

describe('SocketMaster', function() {
  var sm, mcp;

  beforeEach(function() {
    mcp = {
      robots: {
        rosie: {
          devices: {
            led: 'led'
          }
        },
        thelma: {
          devices: {
            asensor: 'asensor'
          }
        }
      }
    };
    sm = new SocketMaster({}, mcp);
    stub(console, "log");
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
      expect(sm.socketDevices).to.be.calledWith({ devices: { led: 'led' } });
      expect(sm.socketDevices).to.be.calledWith({
        devices: {
          asensor: 'asensor'
        }
      });
    });
  });
});
