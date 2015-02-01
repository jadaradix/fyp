$(window).load(function() {

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

  $("[data-scroll-to]").click(function(jEvent) {
    doScrollTo($(jEvent.target).attr("data-scroll-to"));
    return false;
  });

  var windowHash = window.location.hash;
  if (windowHash.length >= 2) {
    windowHash = windowHash.substring(1);
    doScrollTo(windowHash);
  }

});