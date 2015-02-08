function bootMuseum(id, callback) {


  async.waterfall([
    function(next) {
      easyAjax("../api/museum/" + id, function(data) {
        if ("error" in data) {
          doScrollTo("museum-error", false);
          if (callback) callback();
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
      doScrollTo("museum-section", false, next);
    },
    function(next) {
      if (callback) callback();
    }
  ]);


}