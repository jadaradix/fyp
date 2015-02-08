// AJAX from jadaSite (https://github.com/jadaradix/jadaSite)
function easyAjax(url, callback) {

  function ajaxSuccess(data) {
    callback(data);
  }

  function ajaxFail(data) {
    console.log("(easyAjax->ajaxFail: %s)", data["error"]);
    callback(data);
  }

  var ajaxRequest = $.ajax(url);
  ajaxRequest.done(function(response) {
    if (!response["error"]) {
      ajaxSuccess(response);
    } else {
      ajaxFail(response);
    }
  });
  ajaxRequest.fail(function(response) {
    ajaxFail({
      "error": "I couldn't reach '" + url + "'"
    });
  });

}

function doScrollTo(what, doScroll, doHide) {
  var doScroll = ((doScroll == undefined) ? true : doScroll);
  var doHide = ((doHide == undefined) ? true : doHide);
  // console.log("2: %s", what);
  // console.log("3:()");
  // console.log(doScroll);
  var el = document.getElementById(what);
  if (!el) return;
  el = $(el);
  async.waterfall([
    function(next) {
      if (doHide) $(".section-wrapper.hide").css("display", "none");
      el.css("display", "block");
      if (doScroll) {
        next();
      } else {
        return;
      }
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

function dScrollTop() {
  var body = $("body");
  body.animate(
    { scrollTop: 0 },
    500,
    "swing"
  );
}

function keepSizeRatio(jEl, ratio) {
  var w = jEl.width();
  jEl.height(w * ratio);
}

$(window).load(function() {

  $("[data-scroll-to]").click(function(jEvent) {
    if (window.location.pathname != "/") return true;
    doScrollTo($(jEvent.target).attr("data-scroll-to"));
    return false;
  });

  var windowHash = window.location.hash;
  if (windowHash.length >= 2) {
    windowHash = windowHash.substring(1);
    doScrollTo(windowHash, true, false);
  }

});