function Exhibition(name, element) {

  var _self = this;

  _self.name = (name || "Exhibition");
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
  _self.exhibitionElements = [];
  _self.exhibitions = [];

  // Get Main Element
  if (!element) return;
  element = $("#" + element);
  if (element) {
    _self.museumElement = element;
  } else return;

  // Get Side Element
  _self.sideElement = $("> .side", _self.museumElement);

  // Populate Exhibition Array from Exhibition Elements
  _self.exhibitionElements = $("> .exhibition", _self.museumElement);
  $.each(_self.exhibitionElements, function(index, exhibitionElement) {
    var tExhibition = $(exhibitionElement);
    _self.exhibitions.push(
      new Exhibition(tExhibition.attr("id"), tExhibition)
    );
  });

  // Set Size
  _self.updateSize = function() {
    var w = $(".exhibition-width", _self.element).width();
    var t = w / 2;

    $.each(_self.exhibitions, function(index, exhibition) {
      exhibition.translate = t;
      exhibition.element.height(w);
      $(".wall.left", exhibition.wallsElement).css("transform", "rotateY(90deg) translateZ(-" + t + "px)");
      $(".wall.right", exhibition.wallsElement).css("transform", "rotateY(-90deg) translateZ(-" + t + "px)");
      $(".wall.top", exhibition.wallsElement).css("transform", "rotateX(-90deg) translateZ(-" + t + "px)");
      $(".wall.bottom", exhibition.wallsElement).css("transform", "rotateX(-90deg) translateZ(" + t + "px) scaleY(-1)");
      $(".wall.back", exhibition.wallsElement).css("transform", "rotateX(-180deg) translateZ(" + t + "px) scaleY(-1)");
      exhibition.setZoom(exhibition.zoom);
      exhibition.setPerspective(exhibition.perspective);
    });

  }
  _self.updateSize();

  // Show Exhibition
  _self.showExhibition = function(name) {
    $.each(_self.exhibitions, function(index, exhibition) {
      exhibition.element.css("display", "none");
    });
    var exhibition = ($.grep(_self.exhibitions, function(exhibition, index) {
      return (exhibition.name == name);
    }) || [null])[0];
    exhibition.element
      .css("display", "block")
      .css("opacity", 1);
    _self.sideElement.css("opacity", 1);
    return exhibition;
  }

}