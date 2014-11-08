function getRoomWalls(room) {
  return $("> .walls", room);
}

function makeRoom(element, size, translate, perspective, zoom) {

  var room = $("#" + element);
  var walls = getRoomWalls(room);

  // Room
  room.css("width", size + "px");
  room.css("height", size + "px");
  room.css("perspective", perspective + "px");

  // Walls
  walls.css("transform", "translateZ(-" + translate + "px) scaleX(" + zoom + ") scaleY(" + zoom + ")");

  // Individual Walls
  $(".wall.left", walls).css("transform", "rotateY(90deg) translateZ(-" + translate + "px)");
  $(".wall.right", walls).css("transform", "rotateY(-90deg) translateZ(-" + translate + "px)");
  $(".wall.top", walls).css("transform", "rotateX(-90deg) translateZ(-" + translate + "px)");
  $(".wall.bottom", walls).css("transform", "rotateX(-90deg) translateZ(" + translate + "px) scaleY(-1)");
  $(".wall.back", walls).css("transform", "rotateX(-180deg) translateZ(" + translate + "px) scaleY(-1)");

  // Return room jQuery selector
  return room;

}

$(window).load(function() {

  // Definitions
  var size = 600;
  var translate = 300;
  var perspective = 400;
  var zoom = 1;

  // Make room, get walls
  var room = makeRoom("room", size, translate, perspective, zoom);
  var walls = getRoomWalls(room);

  // Zoom in via VBL
  function vbl() {
    walls.css("transform", "translateZ(-" + translate + "px) scaleX(" + zoom + ") scaleY(" + zoom + ")");
    zoom += 0.001;
  }
  // setInterval(vbl, 100);

  // Fade In
  room.fadeIn(1000);

});