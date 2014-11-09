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

  // Advance Poster work
  var posterIntervalId;
  var poster = $("#poster");
  var posterText = "I believe in you so much. When we are together in person I will prove my love and belief in you. I think about being with you every day... I love you, James. I love you so much.";
  var posterTextCharacters = posterText.split("");
  var posterTextCurrentCharacter = 0;
  var posterTextCurrent = "";
  function posterNext() {
    if (posterTextCurrentCharacter == posterText.length) {
      return true;
    }
    posterTextCurrent += posterTextCharacters[posterTextCurrentCharacter];
    poster.html(posterTextCurrent);
    posterTextCurrentCharacter += 1;
    return false;
  }

  async.waterfall([
    function(next) {
      // room.fadeIn(1000, next);
      room.fadeIn(1000);
      next();
    },
    function(next) {
      setTimeout(next, 1500);
    },
    function(next) {
      var intervalId = setInterval(function() {
        loopRoom();
        if (zoom <= 1.9) {
          posterIntervalId = setInterval(function() {
            if (posterNext()) clearInterval(posterIntervalId);
          }, 2000);
        }
        if (zoom <= 1) {
          clearInterval(intervalId);
          next();
        }
      }, (1000 / fps));
    },
    function(next) {
      setTimeout(next, 3000);
    },
    function(next) {
      room.fadeOut(1000);
    }
  ]);

});