function Museum(element, zoom, perspective) {

  var _self = this;

  // Element Definitions
  _self.museumElement = null;
  _self.roomElement = null;
  _self.sideElement = null;
  _self.wallsElement = null;

  // Generic Definitions
  _self.zoom = 1;
  _self.perspective = 256;
  _self.translate = 0;

  // Get Main Element
  if (!element) return;
  element = $("#" + element);
  if (element) {
    _self.museumElement = element;
  } else return;

  // Get Room and Wall Elements
  _self.roomElement = $("> .room", _self.museumElement);
  _self.sideElement = $("> .side", _self.museumElement);
  _self.wallsElement = $("> .walls", _self.roomElement);

  // Get Room
  _self.getRoom = function() {
    return _self.roomElement;
  }

  // Set Size
  _self.updateSize = function() {

    var w = _self.roomElement.outerWidth();
    console.log(w);
    _self.translate = w / 2;
    _self.roomElement.height(w);

    // _self.roomElement.css("width", roomSize + "px");
    // _self.roomElement.css("height", roomSize + "px");
    $(".wall.left", _self.wallsElement).css("transform", "rotateY(90deg) translateZ(-" + _self.translate + "px)");
    $(".wall.right", _self.wallsElement).css("transform", "rotateY(-90deg) translateZ(-" + _self.translate + "px)");
    $(".wall.top", _self.wallsElement).css("transform", "rotateX(-90deg) translateZ(-" + _self.translate + "px)");
    $(".wall.bottom", _self.wallsElement).css("transform", "rotateX(-90deg) translateZ(" + _self.translate + "px) scaleY(-1)");
    $(".wall.back", _self.wallsElement).css("transform", "rotateX(-180deg) translateZ(" + _self.translate + "px) scaleY(-1)");

  }
  _self.updateSize();

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

  // Show Museum
  _self.show = function() {
    _self.roomElement.css("opacity", 1);
    _self.sideElement.css("opacity", 1);
  }

  // Debug
  console.log(_self.museumElement);
  console.log(_self.roomElement);
  console.log(_self.wallsElement);

  // Initialise
  _self.setZoom(zoom);
  _self.setPerspective(perspective);

}