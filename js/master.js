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

  var m = new Museum("colours");
  function showRoomZoom(room) {
    function loop(room) {
      room.zoom += 0.001;
      if (room.zoom >= 2) {
        room.zoom = 2;
        return true;
      }
      room.setZoom(room.zoom);
      return false;
    }
    var r = m.showRoom(room);
    r.zoom = 1;
    r.setLoopFunction(loop);
  }

  showRoomZoom("room-blue");

  $("#show-red-room-button").click(function() {
    showRoomZoom("room-red");
  });

  $("#show-green-room-button").click(function() {
    showRoomZoom("room-green");
  });

  $("#show-blue-room-button").click(function() {
    showRoomZoom("room-blue");
  });

});