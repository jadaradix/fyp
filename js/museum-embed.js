(function($) {

  function bootMuseum(id) {


    async.waterfall([
      function(next) {
        easyAjax("../api/museum/" + id, function(data) {
          if ("error" in data) {
            doScrollTo("museum-error", false, false);
            return;
          }
          next(null, data);
        });
      },
      function(data, next) {
        if (!data) return;
        console.log(data);
        var museumEl = $("#museum");
        var topicNames = $.map(data.topics, function(topic) {
          return topic.title;
        });
        var topicsString = topicNames.join(", ");
        $("p", museumEl).html(topicsString);
        next();
      },
      function(next) {
        doScrollTo("museum-section", false, false);
      }
    ]);


  }

  $(window).ready(function() {
    var museumId = $("#museum").attr("data-museum-id");
    bootMuseum(museumId);
  });
})($, _);