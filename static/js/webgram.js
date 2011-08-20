(function() {

  var routes = {
    '/': 'home',
    '/login': 'login'
  };

  var Webgram = {};

  var session = Webgram.session = {};

  var initialize = Webgram.initialize = function(session) {
    Webgram.session = session;
    $('#page').empty().append(render('topbar'));
    window.addEventListener('hashchange', function() {
      Webgram.checkHash();
    }, false);
    window.location.hash = "#" + getURI();
    navigate(getURI());
  };
  var getURI = Webgram.getURI = function() {
    var uri = window.location.hash;
    if (uri[0] === '#') uri = uri.substr(1);
    if (uri[0] != '/') uri = '/' + uri;
    return uri;
  };
  var parseRoute = Webgram.checkHash = function(uri) {
    var m, regex;
    for (var path in routes) {
      regex = new RegExp('^'+path.replace(':id', '([^/]+)').replace(/\//g, '\\/') + "$", 'gi');
      m = regex.exec(uri);
      if (m) {
        var id = m[1] || null;
        controller[routes[path]].apply(Webgram, [id]);
        break;
      }
    }
  };
  var navigate = Webgram.navigate = function(uri) {
    if (window.location.pathname != '/')
      return window.location = '/#' + window.location.pathname;
    parseRoute(uri);
  };

  var controller = Webgram.controller = {
    home: function() {
      if (!session.user) {
        $('#page').append(render('anon-home'));
      }
      else {
        $('#page').append(render('feed'));
      }
    }
  };
  var render = Webgram.render = function(name) {
    return _.template($('#template-' + name).text(), session);
  };

  window.Webgram = Webgram;

})();
