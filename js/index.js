$(window).load(function() {

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