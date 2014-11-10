// AJAX from jadaSite (https://github.com/jadaradix/jadaSite)
function easyAjax(url, callback) {

  function ajaxSuccess(data) {
    callback(data);
  }

  function ajaxFail(error) {
    console.log(error);
    callback(null);
  }

  var ajaxRequest = $.ajax(url);
  ajaxRequest.done(function(response) {
    if (!response['error']) {
      ajaxSuccess(response);
    } else {
      ajaxFail(response['error']);
    }
  });
  ajaxRequest.fail(function(response) {
    ajaxFail("I couldn't reach '" + url + "'");
  });

}

$(window).load(function() {

  function loop(museum) {
    museum.zoom += 0.001;
    if (museum.zoom >= 2) {
      museum.zoom = 2;
      return true;
    }
    museum.setZoom(m.zoom);
    return false;
  }

  var s = $("#demo-container").width();
  var m = new Museum("demo", s, 1, 400);
  // m.setLoopFunction(loop);

});