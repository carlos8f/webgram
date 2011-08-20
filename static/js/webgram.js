(function() {

  var routes = {
    '/': 'home',
    '/login': 'login',
    '/access_token=:id': 'access_token'
  };

  var Webgram = {};

  var session = Webgram.session = {};

  var initialize = Webgram.initialize = function(session) {
    this.session = session;

    // Render persistent elements.
    $('#topbar').html(render('topbar'));

    // Standardize the hash.
    window.location.hash = '#' + getURI();

    // Navigate according to the current hash.
    navigate();

    // Listen for hash changes.
    window.addEventListener('hashchange', function() {
      Webgram.navigate();
    }, false);
  };

  var getURI = Webgram.getURI = function() {
    var uri = window.location.hash;
    if (uri[0] === '#') uri = uri.substr(1);
    if (uri[0] != '/') uri = '/' + uri;
    return uri;
  };

  var navigate = Webgram.navigate = function(uri) {
    var m, regex;
    uri = uri || getURI();
    for (var path in routes) {
      regex = new RegExp('^'+path.replace(':id', '([^/]+)').replace(/\//g, '\\/') + "$", 'gi');
      m = regex.exec(uri);
      if (m) {
        var id = m[1] || null;
        $('#page').empty();
        controller[routes[path]].apply(Webgram, [id]);
        break;
      }
    }
  };

  var render = Webgram.render = function(name) {
    return _.template($('#template-' + name).text(), session);
  };

  var controller = Webgram.controller = {
    home: function() {
      if (!session.user) {
        $('#page').append(render('anon-home'));
      }
      else {
        $('#page').append(render('feed'));
      }
    },
    login: function() {
      window.location = 'http://instagram.com/oauth/authorize/?client_id=' + escape(this.session.client_id) + '&redirect_uri=' + escape('http://localhost:3000/') + '&response_type=token&scope=comments+relationships+likes';
    },
    access_token: function(id) {
      navigate('/');
    }
  };

  window.Webgram = Webgram;

})();
