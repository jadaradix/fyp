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

  var m = new Museum("colours");
  function showExhibitionZoom(exhibition) {
    function loop(exhibition) {
      exhibition.zoom += 0.001;
      if (exhibition.zoom >= 2) {
        exhibition.zoom = 2;
        return true;
      }
      exhibition.setZoom(exhibition.zoom);
      return false;
    }
    m.showExhibition(exhibition);
    // var r = m.showRoom(room);
    // r.zoom = 1;
    // r.setLoopFunction(loop);
  }

  $("[data-scroll-to]").click(function(jEvent) {
    var el = $("#" + $(jEvent.target).attr("data-scroll-to"));
    async.waterfall([
      function(next) {
        $(".section-wrapper.hide").css("display", "none");
        el.css("display", "block");
        // el.animate(
        //   { height: "100%" },
        //   1000,
        //   "swing"
        // );
        // el.show(250, next);
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
    return false;
  });

  $("#show-a-button").click(function() {
    showExhibitionZoom("a");
  });

  $("#show-b-button").click(function() {
    showExhibitionZoom("b");
  });

  showExhibitionZoom("a");

  // easyAjax("api/museum/1", function(museum) {
  //   console.log(museum);
  // });

});