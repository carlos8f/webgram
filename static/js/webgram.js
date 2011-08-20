(function() {

  var apiBase = 'https://api.instagram.com/v1';

  var routes = {
    '/': 'home',
    '/login': 'login',
    '/access_token=:id': 'access_token',
    '/logout': 'logout'
  };

  var Webgram = {};

  var session = Webgram.session = {};

  var lastURI;

  var initialize = Webgram.initialize = function(session) {
    Webgram.session = session;

    // Render persistent elements.
    $('#topbar').html(render('topbar'));

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
    if (uri === lastURI) {
      return;
    }
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
    return _.template($('#template-' + name).text(), Webgram);
  };

  var controller = Webgram.controller = {
    home: function() {
      if (!Webgram.session.user) {
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
      $.ajax({
        url: apiBase + '/users/self',
        dataType: 'jsonp',
        data: {access_token: id},
        success: function(data) {
          // Fill the session variable.
          Webgram.session = {client_id: Webgram.session.client_id, user: data.data, access_token: id};
          // Re-render topbar with logged-in stuff.
          $('#topbar').html(render('topbar'));

          // Notify the server for session persistence.
          $.ajax({
            url: '/session',
            type: 'POST',
            data: Webgram.session
          });

          // Go back home.
          window.location.hash = '#/';
        }
      });
    },
    logout: function() {
      // Clear out the session variable.
      Webgram.session = {client_id: Webgram.session.client_id, user: null, access_token: null};
      // Re-render topbar with logged-out stuff.
      $('#topbar').html(render('topbar'));

      // Notify the server for session persistence.
      $.ajax({
        url: '/session',
        type: 'POST',
        data: Webgram.session
      });

      // Go back home.
      window.location.hash = '#/';
    }
  };

  var bootstrap = Webgram.bootstrap = function(session) {
    // Initialize when the DOM is ready.
    $(function() {
      initialize(session);
    });
  }

  window.Webgram = Webgram;

})();
