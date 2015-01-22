$(window).load(function() {

  var twitter = $("#twitter");
  twitter.focus();
  if ("selectionStart" in twitter) {
  }
  twitter[0].selectionStart = 1;
  twitter[0].selectionEnd = twitter.attr("value").length;
  console.log("done");

});