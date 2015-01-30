/* jshint expr:true */
"use strict";

//var https = require("https"),
    //path = require("path");

var API = source("socketio-api");

//var MockRequest = support("mock_request"),
//MockResponse = support("mock_response");

describe("Socket.io API", function() {
  var api;

  beforeEach(function() {
    api = new API();
    stub(console, "log");
  });

  it("needs tests!!!");
  /*
  afterEach(function() {
    console.log.restore();
  });

  describe("constructor", function() {
    var mod;

    beforeEach(function() {
      mod = new API({
        host: "0.0.0.0",
        port: "1234"
      });
    });

    it("sets @express to an Express instance", function() {
      expect(api.express.listen).to.be.a("function");
    });

    it("sets default values", function() {
      expect(api.host).to.be.eql("127.0.0.1");
      expect(api.port).to.be.eql("3000");
    });

    it("overrides default values if passed to constructor", function() {
      expect(mod.host).to.be.eql("0.0.0.0");
      expect(mod.port).to.be.eql("1234");
    });

    it("sets the server title", function() {
      var title = api.express.get("title");
      expect(title).to.be.eql("Cylon API Server");
    });
  });

  describe("default", function() {
    var d = API.prototype.defaults;

    it("host", function() {
      expect(d.host).to.be.eql("127.0.0.1");
    });

    it("port", function() {
      expect(d.port).to.be.eql("3000");
    });

    it("auth", function() {
      expect(d.auth).to.be.eql(false);
    });

    it("CORS", function() {
      expect(d.CORS).to.be.eql("");
    });

    it("ssl", function() {
      var sslDir = path.normalize(__dirname + "/../../lib/api/ssl/");
      expect(d.ssl.key).to.be.eql(sslDir + "server.key");
      expect(d.ssl.cert).to.be.eql(sslDir + "server.crt");
    });
  });

  describe("#createServer", function() {
    it("sets @express to an express server", function() {
      api.express = null;
      api.createServer();
      expect(api.express).to.be.a("function");
    });

    context("if SSL is configured", function() {
      it("sets @server to a https.Server instance", function() {
        api.createServer();
        expect(api.server).to.be.an.instanceOf(https.Server);
      });
    });

    context("if SSL is not configured", function() {
      beforeEach(function() {
        api.ssl = false;
        api.createServer();
      });

      it("logs that the API is insecure", function() {
        expect(console.log).to.be.calledWithMatch("insecure connection");
      });

      it("sets @server to @express", function() {
        expect(api.server).to.be.eql(api.express);
      });
    });
  });

  describe("#setupAuth", function() {
    context("when auth.type is basic", function() {
      beforeEach(function() {
        api.auth = { type: "basic", user: "user", pass: "pass" };
      });

      it("returns a basic auth middleware function", function() {
        var fn = api.setupAuth(),
            req = new MockRequest(),
            res = new MockResponse(),
            next = spy();

        var auth = "Basic " + new Buffer("user:pass").toString("base64");

        req.headers.authorization = auth;

        fn(req, res, next);
        expect(next).to.be.called;
      });
    });

    context("when auth is null", function() {
      beforeEach(function() {
        api.auth = null;
      });

      it("returns a pass-through middleware function", function() {
        var fn = api.setupAuth(),
            next = spy();

        fn(null, null, next);
        expect(next).to.be.called;
      });
    });
  });

  describe("#listen", function() {
    beforeEach(function() {
      // we create a plain HTTP server to avoid a log message from Node
      api.ssl = false;
      api.createServer();
      api.express.set("title", "Cylon API Server");

      stub(api.server, "listen").yields();

      api.listen();
    });

    afterEach(function() {
      api.server.listen.restore();
    });

    it("listens on the configured host and port", function() {
      expect(api.server.listen).to.be.calledWith("3000", "127.0.0.1");
    });

    context("when the server is running", function() {
      it("logs that it's online and listening", function() {
        var online = "Cylon API Server is now online.",
            listening = "Listening at http://127.0.0.1:3000";

        expect(console.log).to.be.calledWith(online);
        expect(console.log).to.be.calledWith(listening);
      });
    });
  });
 */
});
