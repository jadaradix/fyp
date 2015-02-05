(function($) {

  function bootMuseum(id) {


    console.log(id);


    async.waterfall([
      function(next) {
        easyAjax("../api/museum/" + id, function(data) {
          // fix: might not be a twitter account...
          if ("error" in data) {
            // window.location = "../twitter/" + id;
            // return;
          }
          next(null, data);
        });
      },
      function(data, next) {
        console.log(data);
      }
    ]);


  }

  $(window).ready(function() {
    var museumId = $("#museum").attr("data-museum-id");
    bootMuseum(museumId);
  });
})($, _);