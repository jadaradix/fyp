(function($) {
  $(window).ready(function() {
    var label = $("#processing > div");
    var canvas = $("#processing > canvas");
    function resize() {
      keepSizeRatio(label, (480 / 640) * 0.15);
      keepSizeRatio(canvas, (480 / 640));
      label.css("top", ((canvas.height() / 2) - (label.height() / 2)) + "px");
    }
    $(window).resize(resize);
    setTimeout(resize, 0); //don't ask
    label.css("display", "block");
    canvas.css("display", "block");

    var width = canvas.width();
    var height = canvas.height();
    var letters = Array(256).join(1).split('');

    var draw = function () {
      var ctx = canvas[0].getContext('2d');
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width,height);
      ctx.fillStyle = canvas.css("color");
      letters.map(function(y_pos, index){
        text = String.fromCharCode(3e4 + Math.random() * 33);
        x_pos = index * 10;
        ctx.fillText(text, x_pos, y_pos);
        letters[index] = (y_pos > 758 + Math.random() * 1e4) ? 0 : y_pos + 10;
      });
    };

    setInterval(draw, 33);

  });
})($);