(function() {

  function Webgram(session) {
    this.session = session;
    this.initialize = function() {
      $('#page').append(this.render('topbar'));
      if (!this.session.user) {
        $('#page').append(this.render('anon-home'));
      }
    };
    this.render = function(name) {
      return _.template($('#template-' + name).text(), this);
    };
    this.initialize();
  }
  window.Webgram = Webgram;

})();