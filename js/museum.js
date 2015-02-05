(function($, _) {


  $(document).ready(function() {

    var shareBox = $(document.getElementById("share-box"));
    shareBox.val(window.location.href);

    // var test = $("#test");
    // console.log(test);
    // test.bind("load", function(e) {
    //   console.log(e);
    // });

  });


})($, _);