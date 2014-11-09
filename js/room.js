// Internal Definitions
var room;
var walls;
var zoom = 3.2;
// zoom = 2;

// User Definitions
var perspective = 400;
var size = 512;
var translate = 256;
var fps = 20;
var zoomIncrement = -0.005;

function getRoom(element) {
  return $("#" + element);
}

function getWalls(room) {
  return $("> .walls", room);
}

function updateRoom() {

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

function resizeRoom() {
  var w = $(window).width();
  var h = $(window).height();
  size = Math.min(w, h) - 32;
  translate = size / 2;
  updateRoom();
}

function loopRoom() {
  walls.css("transform", "translateZ(-" + translate + "px) scaleX(" + zoom + ") scaleY(" + zoom + ")");
  zoom += zoomIncrement;
  // console.log(zoom);
}