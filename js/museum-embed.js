function MuseumClass() {

  var _self = this;

  // Element Definitions
  _self.museumElement = null;
  _self.sideElement = null;
  _self.exhibitionElement = null;
  _self.wallsElement = null;

  // Other Definitions
  _self.zoom = 1;
  _self.perspective = 350;
  _self.translate = 0;

  // Get Element
  element = $("#museum");
  if (element) {
    _self.museumElement = element;
  } else return;
  _self.sideElement = $("> .side", _self.museumElement);
  _self.exhibitionElement = $("> .exhibition", _self.museumElement);
  _self.wallsElement = $("> .walls", _self.exhibitionElement);

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
    _self.exhibitionElement.css("perspective", _self.perspective + "px");
  }

  // Set Size
  _self.updateSize = function() {
    var w = $("> .museum-width", _self.museumElement).width();
    console.log(w);
    var t = w / 2;
    _self.exhibitionElement.height(w);
    _self.translate = t;
    $(".wall.left", _self.wallsElement).css("transform", "rotateY(90deg) translateZ(-" + t + "px)");
    $(".wall.right", _self.wallsElement).css("transform", "rotateY(-90deg) translateZ(-" + t + "px)");
    $(".wall.top", _self.wallsElement).css("transform", "rotateX(-90deg) translateZ(-" + t + "px)");
    $(".wall.bottom", _self.wallsElement).css("transform", "rotateX(-90deg) translateZ(" + t + "px) scaleY(-1)");
    $(".wall.back", _self.wallsElement).css("transform", "rotateX(-180deg) translateZ(" + t + "px) scaleY(-1)");
    _self.setZoom(_self.zoom);
    _self.setPerspective(_self.perspective);
  }

  // Show
  _self.show = function() {
    _self.exhibitionElement
      .css("display", "block")
      .css("opacity", 1);
    _self.sideElement.css("opacity", 1);
    _self.updateSize();
  }

}




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

      // console.log(data);
      // var museumEl = $("#museum");
      // var topicNames = $.map(data.topics, function(topic) {
      //   return topic.title;
      // });
      // var topicsString = topicNames.join(", ");
      // $("p", museumEl).html(topicsString);

      var m = new MuseumClass();
      m.show();

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