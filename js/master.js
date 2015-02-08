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

function doScrollTo(what, doScroll, callback) {
  var doScroll = ((doScroll == undefined) ? true : doScroll);
  var doKeepMuseumSection = ((doKeepMuseumSection == undefined) ? false : doKeepMuseumSection);
  var el = document.getElementById(what);
  if (!el) return;
  el = $(el);
  async.waterfall([
    function(next) {
      var els = $(".section-wrapper.hide");
      els = els.filter(function(index, lEl) {
        return (($(lEl).attr("id") != "museum-section") && ($(lEl).attr("id") != "museum-error"));
      });
      els.css("display", "none");
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
        "swing",
        function() {
          if (callback) callback();
        }
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

  function showMuseum(callback) {
    var museumId = $("#museum").attr("data-museum-id");
    if (!museumId) return;
    bootMuseum(museumId, callback);
  }

  $("[data-scroll-to]").click(function(jEvent) {
    if (window.location.pathname != "/") return true;
    doScrollTo($(jEvent.target).attr("data-scroll-to"), true);
    return false;
  });

  var windowHash = window.location.hash;
  if (windowHash.length >= 2) {
    windowHash = windowHash.substring(1);
    showMuseum(function() {
      doScrollTo(windowHash, true);
    });
  } else {
    showMuseum();
  }

});