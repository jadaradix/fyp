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

function doScrollTo(what) {
  var el = document.getElementById(what);
  if (!el) return;
  el = $(el);
  async.waterfall([
    function(next) {
      $(".section-wrapper.hide").css("display", "none");
      el.css("display", "block");
      next();
    },
    function(next) {
      var body = $("body");
      var scrollTop = el.offset().top;
      body.animate(
        { scrollTop: scrollTop },
        500,
        "swing"
      );
    }
  ]);
}