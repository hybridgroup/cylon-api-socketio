'use strict';

var API = lib('api');

var http = require('http');

describe('Socket.io API', function() {
  var api;

  beforeEach(function() {
    api = new API({ mcp: { attr1: 'mcp' } });
    stub(console, 'log');
  });

  afterEach(function() {
    console.log.restore();
  });

  describe('#constructor', function() {
    it('sets @name', function() {
      expect(api.name).to.be.eql('socketio');
    });

    it('sets @host', function() {
      expect(api.host).to.be.eql('127.0.0.1');
    });

    it('sets @port', function() {
      expect(api.port).to.be.eql('3000');
    });

    it('sets @port', function() {
      expect(api.mcp).to.be.eql({ attr1: 'mcp' });
    });

    it('sets opts to an {} if null is passed', function() {
      var instance = new API();
      expect(instance.mcp).to.be.undefined();
    });
  });

  describe('#start', function() {
    beforeEach(function() {
      api.createServer = stub();
      api.listen = stub();

      api.start();
    });

    it('calls #createServer', function() {
      expect(api.createServer).to.be.called;
    });

    it('calls #listen', function() {
      expect(api.listen).to.be.called;
    });
  });

  describe('#createServer', function() {
    var server, sm;

    beforeEach(function() {
      server = {};
      sm = {};

      stub(http, 'createServer').returns(server);

      api._newSM = stub().returns(sm);

      api.createServer();
    });

    afterEach(function() {
      http.createServer.restore();
    });

    it('creates a new HTTP server', function() {
      expect(http.createServer).to.be.called;

      expect(api.server).to.be.eql(server);
      expect(api.http).to.be.eql(server);
    });

    it('creates a new SocketMaster', function() {
      expect(api._newSM).to.be.called;
      expect(api.sm).to.be.eql(sm);
    });
  });

  describe('#listen', function() {
    beforeEach(function() {
      api.server = { listen: stub() };

      api.sm = {
        start: stub(),
        io: { set: stub() }
      };

      api.listen();
    });

    it('tells the HTTP server to start listening', function() {
      expect(api.server.listen).to.be.calledWith(api.port);
    });

    context('when the server has initialized', function() {
      beforeEach(function() {
        api.server.listen.yield();
      });

      it('starts the socketmaster', function() {
        expect(api.sm.start).to.be.called;
      });

      it('sets a CORS policy for the socketmaster', function() {
        expect(api.sm.io.set).to.be.calledWith('origins', api.CORS);
      });

      it('logs when it has started', function() {
        expect(console.log).to.be.calledWith(
          'SocketIO server listening at 127.0.0.1:3000'
        );
      });
    });
  });
});
