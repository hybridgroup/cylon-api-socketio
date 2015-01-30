/* jshint expr:true */
"use strict";

//var https = require("https"),
    //path = require("path");

var API = source('api');

// var http = ('http');
//var SocketMaster = require('../../lib/socket-master.js');

describe("Socket.io API", function() {
  var api;

  beforeEach(function() {
    api = new API({ mcp: { attr1: 'mcp' } });
    //stub(console, "log");
  });

  afterEach(function() {
    //console.log.restore();
  });

  describe("#constructor", function() {
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
  });

  describe('#createServer', function() {
     var res, next, ins;

    beforeEach(function() {
      ins = {
        set: stub(),
        get: stub(),
        use: stub()
      };

      stub(api, '_express').returns(ins);
      stub(api, '_newSM').returns({ start: spy() });
      stub(api, '_http').returns({});

      res = {
        sendFile: spy(),
        status: spy(),
        json: spy()
      };

      next = spy();

      ins.get.yields(null, res);
      ins.use.yields({}, null, res, next);

      api.createServer();
    });

    afterEach(function() {
      api._newSM.restore();
      api._express.restore();
    });

    it('sets @express', function() {
      expect(api.express).to.not.be.undefined();
    });

    it('sets @server', function() {
      expect(api.server).to.not.be.undefined();
    });

    it('sets @http', function() {
      expect(api.http).to.not.be.undefined();
    });

    it('calls #_newSM', function() {
      expect(api._newSM).to.be.calledOnce;
    });

    it('sets #sm', function() {
      expect(api.sm).to.not.be.undefined();
    });

    it('calls #sm#start', function() {
      expect(api.sm.start).to.be.calledOnce;
    });

    it('calls #express#set with', function() {
      var txt = 'Cylon Socket.io API Server';
      expect(api.express.set).to.be.calledWith('title', txt);
    });

    it('calls #express#get with', function() {
      expect(api.express.get).to.be.calledWith('/');
    });

    it('calls #express#get to trigger a callback and call', function() {
      expect(res.sendFile).to.be.calledOnce;
    });

    it('calls #express#use', function() {
      expect(api.express.use).to.be.calledOnce;
    });

    it('calls #express#use ', function() {
      expect(api.express.use).to.be.calledOnce;
    });

    describe('#express#use', function() {
      it('calls res#status with 500', function() {
        expect(res.status).to.be.calledWith(500);
      });

      it('calls res#json to be called with', function() {
        expect(res.json).to.be.calledWith({ error: 'An error occured.' });
      });
    });
  });

  describe('#listen', function() {
    var server;
    beforeEach(function() {
      server = {
        listen: stub()
      };

      stub(console, 'log');
      server.listen.yields();

      api.server = server;
      api.express = { get: stub().returns('MyTitle') };

      api.listen();
    });

    afterEach(function() {
      console.log.restore();
    });

    it('calls #server#listen with', function() {
      expect(server.listen).to.be.calledOnce;
    });

    it('triggers the anonymous function and writes to console ', function() {
      var txt1 = 'Listening MyTitle @127.0.0.1:3000';
      expect(console.log).to.be.calledWith('Cylon + Socket.io is now online.');
      expect(console.log).to.be.calledWith(txt1);
    });
  });


});
