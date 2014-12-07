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

var m;

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
  var r = m.showExhibition(exhibition);
  r.zoom = 1;
  r.setLoopFunction(loop);
}

$(window).load(function() {

  m = new Museum("demo");

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

  showExhibitionZoom("exhibit-1");

  easyAjax("api/museum/1", function(museum) {
    var els = $("#exhibit-1 .exhibit.fill");
    console.log("Museum:");
    console.log(museum);
    console.log("Exhibitions:");
    console.log(museum.exhibitions);
    var colours = [
      "#EC0B6D",
      "#F47920",
      "#FCB940",
      "#74B643",
      "#2EA995"
    ];
    var exhibition = museum.exhibitions[0];
    $.each(els, function(index, el) {
      var exhibit = exhibition.exhibits[index];
      var colour = colours[index];
      var html = "";
      if (exhibit.type == "text") {
        html = "<div class=\"text\" style=\"background-color: " + colour + ";\"><h1>" + exhibit.name + "</h1><p>" + exhibit.data + "</p></div>";
      } else if (exhibit.type == "picture") {
        html = "<div class=\"picture\"><img src=\"" + exhibit.data + "\" alt=\"" + exhibit.name + "\"></div>";
      }
      $(el).html(html);
    })
  });

});