// AJAX from jadaSite (https://github.com/jadaradix/jadaSite)
function easyAjax(url, callback) {

  function ajaxSuccess(data) {
    callback(data);
  }

  function ajaxFail(error) {
    console.log(error);
    callback(null);
  }

  var ajaxRequest = $.ajax(url);
  ajaxRequest.done(function(response) {
    if (!response['error']) {
      ajaxSuccess(response);
    } else {
      ajaxFail(response['error']);
    }
  });
  ajaxRequest.fail(function(response) {
    ajaxFail("I couldn't reach '" + url + "'");
  });

}

$(window).load(function() {

  // Get Some Data
  var topics = ["Self-portraits_by_Rembrandt"];
  var topic = topics[0];
  var wikipediaUrl = "http://en.wikipedia.org/w/api.php?format=json&action=query&titles=" + topic + "&prop=revisions&rvprop=content";
  async.waterfall([
    function(next) {
      easyAjax(wikipediaUrl, function(data) {
        next(null, data);
      });
    },
    function(data, next) {
      if (data) {
        console.log(data);
      }
    }
  ]);

  // Get room and walls
  room = getRoom("room");
  walls = getWalls(room);

  //Set the room size for the first time
  resizeRoom();

  //Set the room size when the window resizes
  $(window).resize(function() {
    resizeRoom();
  });

  async.waterfall([
    function(next) {
      // room.fadeIn(1000, next);
      room.fadeIn(1000);
      next();
    },
    function(next) {
      // setInterval(loopRoom, (1000 / fps));
    }
  ]);

});