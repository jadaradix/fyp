(function($) {

  $(document).ready(function() {

    // var test = $("#test");
    // console.log(test);
    // test.bind("load", function(e) {
    //   console.log(e);
    // });

  });

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