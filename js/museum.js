function Room(name, element) {

  var _self = this;

  _self.name = (name || "Room");
  _self.element = (element || null);
  _self.wallsElement = $("> .walls", element);
  _self.zoom = 1;
  _self.perspective = 350;
  _self.translate = 0;

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
    _self.element.css("perspective", _self.perspective + "px");
  }

  // Set Loop Function
  _self.loopIntervalId = null;
  _self.setLoopFunction = function(f) {
    clearInterval(_self.loopIntervalId);
    _self.loopIntervalId = setInterval(function() {
      if (f(_self)) {
        clearInterval(_self.loopIntervalId);
      }
    }, (1000 / 20));
  }

}

function Museum(element) {

  var _self = this;

  // Element Definitions
  _self.museumElement = null;
  _self.sideElement = null;
  _self.roomElements = [];
  _self.rooms = [];

  // Get Main Element
  if (!element) return;
  element = $("#" + element);
  if (element) {
    _self.museumElement = element;
  } else return;

  // Get Side Element
  _self.sideElement = $("> .side", _self.museumElement);

  // Populate Room Array from Room Elements
  _self.roomElements = $("> .room", _self.museumElement);
  $.each(_self.roomElements, function(index, roomElement) {
    var tRoom = $(roomElement);
    _self.rooms.push(
      new Room(tRoom.attr("id"), tRoom)
    );
  });

  // Set Size
  _self.updateSize = function() {
    var w = $(".room-width", _self.element).width();
    var t = w / 2;

    $.each(_self.rooms, function(index, room) {
      room.translate = t;
      room.element.height(w);
      $(".wall.left", room.wallsElement).css("transform", "rotateY(90deg) translateZ(-" + t + "px)");
      $(".wall.right", room.wallsElement).css("transform", "rotateY(-90deg) translateZ(-" + t + "px)");
      $(".wall.top", room.wallsElement).css("transform", "rotateX(-90deg) translateZ(-" + t + "px)");
      $(".wall.bottom", room.wallsElement).css("transform", "rotateX(-90deg) translateZ(" + t + "px) scaleY(-1)");
      $(".wall.back", room.wallsElement).css("transform", "rotateX(-180deg) translateZ(" + t + "px) scaleY(-1)");
      room.setZoom(room.zoom);
      room.setPerspective(room.perspective);
    });

  }
  _self.updateSize();

  // Show Room
  _self.showRoom = function(name) {
    $.each(_self.rooms, function(index, room) {
      room.element.css("display", "none");
    });
    var room = ($.grep(_self.rooms, function(room, index) {
      return (room.name == name);
    }) || [null])[0];
    room.element
      .css("display", "block")
      .css("opacity", 1);
    _self.sideElement.css("opacity", 1);
    return room;
  }

}