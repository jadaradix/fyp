function Museum(element, size, zoom, perspective) {

  var _self = this;

  // Element Definitions
  _self.museumElement = null;
  _self.roomElement = null;
  _self.wallsElement = null;

  // Generic Definitions
  _self.size = 512;
  _self.zoom = 1;
  _self.perspective = _self.size;
  _self.translate = _self.size / 2;

  // Get Element
  if (!element) return;
  element = $("#" + element);
  if (element) {
    _self.museumElement = element;
  } else return;

  // Set Size
  _self.setSize = function(size) {

    if (!size) return;
    _self.size = size;

    var roomSize = _self.size * 1.0;
    _self.translate = roomSize / 2;

    _self.roomElement.css("width", roomSize + "px");
    _self.roomElement.css("height", roomSize + "px");
    $(".wall.left", _self.wallsElement).css("transform", "rotateY(90deg) translateZ(-" + _self.translate + "px)");
    $(".wall.right", _self.wallsElement).css("transform", "rotateY(-90deg) translateZ(-" + _self.translate + "px)");
    $(".wall.top", _self.wallsElement).css("transform", "rotateX(-90deg) translateZ(-" + _self.translate + "px)");
    $(".wall.bottom", _self.wallsElement).css("transform", "rotateX(-90deg) translateZ(" + _self.translate + "px) scaleY(-1)");
    $(".wall.back", _self.wallsElement).css("transform", "rotateX(-180deg) translateZ(" + _self.translate + "px) scaleY(-1)");

  }

  // Set Zoom
  _self.setZoom = function(zoom) {
    if (!zoom) return;
    _self.zoom = zoom;
    _self.wallsElement.css("transform", "translateZ(-" + _self.translate + "px) scaleX(" + _self.zoom + ") scaleY(" + _self.zoom + ")");
  }

  // Set Perspective
  _self.setPerspective = function(perspective) {
    if (!perspective) return;
    _self.perspective = perspective;
    _self.roomElement.css("perspective", _self.perspective + "px");
  }

  // Set Loop Function
  _self.setLoopFunction = function(f) {
    var loopIntervalId;
    loopIntervalId = setInterval(function() {
      if (f(_self)) {
        clearInterval(loopIntervalId);
      }
    }, (1000 / 20));
  }

  // Get Room and Walls
  _self.roomElement = $("> .room", _self.museumElement);
  _self.wallsElement = $("> .walls", _self.roomElement);

  // Debug
  console.log(_self.museumElement);
  console.log(_self.roomElement);
  console.log(_self.wallsElement);

  // Initialise
  _self.setSize(size);
  _self.setZoom(zoom);
  _self.setPerspective(perspective);

  // Show Museum
  _self.museumElement.fadeIn();

}