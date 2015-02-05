(function($) {
  $(window).ready(function() {

    var twitterAccountName = $("html").attr("data-twitter");

    easyAjax("../api/museum/" + twitterAccountName, function(data) {

      if ("error" in data) {
        window.location = "../twitter/" + twitterAccountName;
        return;
      }

      console.log(data);

    });

  });
})($, _);