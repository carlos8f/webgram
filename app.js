
/**
 * Module dependencies.
 */

var express = require('express'),
    app = module.exports = express.createServer(),
    conf = require('./conf.js'),
    _ = require('underscore');

// Configuration
app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret:  conf.session.secret}));
  app.use(app.router);
  app.use(express.static(__dirname + '/static'));
  app.enable('jsonp callback');
  app.register('._', {
    compile: function(str, options) {
      var compiled = _.template(str);
      return function (locals) {
        return compiled(locals);
      };
    }
  });
  // Static HTML render.
  app.register('.html', {
    compile: function(str, options) {
      return function (locals) {
        return str;
      };
    }
  });

  app.set('view engine', '_');
  app.set('view options', {
    layout: false
  });
});
app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});
app.configure('production', function() {
  app.use(express.errorHandler()); 
});

var getSession = function(req) {
  return {client_id: conf.client_id, access_token: req.session.access_token || null, user: req.session.user || null};
}

// Routes
app.get('/', function(req, res) {
  res.render('index.html', getSession(req));
});
app.post('/session', function(req, res) {
  req.session.user = req.body.user == "null" ? null : req.body.user;
  req.session.access_token = req.body.access_token == "null" ? null : req.body.access_token;
  res.send();
});
app.get('/session', function(req, res) {
  res.send(getSession(req));
});

//Only listen on $ node app.js
if (!module.parent) {
  app.listen(conf.port);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}
