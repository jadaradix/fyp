(function($) {
  $(window).ready(function() {

    var label = $("#processing > div");
    var canvas = $("#processing > canvas");

    var twitterAccountName = $("html").attr("data-twitter");

    var gData = null;
    var metricSwitchId;
    var currentMetric = 0;
    function metricSwitch() {
      var tMetric = gData.twitter.metrics[currentMetric];
      $("#data-headline").html(tMetric.headline);
      $("#data-subtext").html(tMetric.subtext);
      if (currentMetric >= gData.twitter.metrics.length - 1) {
        currentMetric = 0;
      } else {
        currentMetric++;
      }
    }

    var pollTimeoutId;
    function poll() {
      easyAjax("api/process/" + twitterAccountName, function(data) {
        if ("error" in data) {
          clearInterval(metricSwitchId);
          clearInterval(pollTimeoutId);
          window.location = "../twitter/" + twitterAccountName;
          return;
        }
        if (!gData) {
          gData = data;
          metricSwitchId = setInterval(metricSwitch, 7500);
          setTimeout(metricSwitch, 0);

          async.waterfall([
            function(next) {
              //matrix setup
              function resize() {
                keepSizeRatio(label, (480 / 640) * 0.15);
                keepSizeRatio(canvas, (480 / 640));
                label.css("top", ((canvas.height() / 2) - (label.height() / 2)) + "px");
              }
              $(window).resize(resize);
              setTimeout(resize, 0); //don't ask
              label.css("display", "block");
              canvas.css("display", "block");
              next();
            },
            function(next) {
              //matrix drawing
              var width = canvas.attr("width");
              var height = canvas.attr("height");
              var ctx = canvas[0].getContext("2d");
              var bgColor = "black";
              var fgColor = canvas.css("color");
              var timesPerSecond = 8;
              var lineCount = height / 16;
              var allLines = $.map(gData.twitter.tweets, function(tweet) {
                var nLine = "> " + tweet.text;
                // var rr1 = _.random(width / 16 / 4);
                // var rr2 = _.random(width / 16);
                // nLine = nLine.substring(width / 16 / 4);
                // nLine = nLine.substring(0, nLine.length - (width / 16 / 4));
                // _(rr2).times(
                //   function(n) { nLine = " " + nLine; }
                // );
                return nLine;
              });
              lines = [];
              _(lineCount).times(
                function(n) { lines.push(allLines[_.random(allLines.length)]); }
              );
              var draw = function() {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = fgColor;
                ctx.font = "normal 16px 'Courier New'";
                $.each(lines, function(index, line) {
                  ctx.fillText(line, 0, (index + 1) * 16);
                });
                lines.shift(); //remove first element
                lines.push(allLines[_.random(allLines.length)]);
              };
              setInterval(draw, 1000 / timesPerSecond);
            }
          ]);

        }
        if (gData.topics.length >= 1) {
          clearInterval(metricSwitchId);
          clearInterval(pollTimeoutId);
          window.location = "../museum/" + twitterAccountName;
          return;
        }
      });
    }
    pollTimeoutId = setInterval(poll, 5000);
    setTimeout(poll, 0);

  });
})($, _);