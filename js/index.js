$(window).load(function() {

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

});