(function($, _) {

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

    //color hack
    var colors = $("#processing > span");
    var colorGreen = colors.css("color");
    var colorRed = colors.css("background-color");

    var drawTimeoutId;
    var stopDrawing;

    function poll() {
      easyAjax("api/process/" + twitterAccountName, function(data) {

        setTimeout(function() {

          //topics
          async.waterfall([
            function(next) {
              doScrollTo("processing-ok", true, next);
            },
            function(next) {
              setTimeout(
                function() {
                  window.location = "../museum/" + twitterAccountName;
                },
                3000
              );
            }
          ]);
          return;

        }, 10000);

        //data already present - we're done
        if (gData) return;

        gData = data;
        metricSwitchId = setInterval(metricSwitch, 4000);
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
            var timesPerSecond = 8;
            var lineCount = height / 16;
            var allLines = $.map(gData.twitter.tweets, function(tweet) {
              var nLine = "> " + tweet.text;
              return nLine;
            });
            lines = [];
            _(lineCount).times(
              function(n) { lines.push(allLines[_.random(allLines.length - 1)]); }
            );
            ctx.font = "normal 16px 'Courier New'";
            var draw = function() {
              ctx.fillStyle = "black";
              ctx.fillRect(0, 0, width, height);
              ctx.fillStyle = colorGreen;
              if (stopDrawing) {
                $("#processing > div p")
                  .css("color", colorRed)
                  .css("border-color", colorRed);
                ctx.fillStyle = colorRed;
              }
              $.each(lines, function(index, line) {
                ctx.fillText(line, 0, (index + 1) * 16);
              });
              lines.shift(); //remove first element
              lines.push(allLines[_.random(allLines.length - 1)]);
              if (stopDrawing) clearInterval(drawTimeoutId);
            };
            drawTimeoutId = setInterval(draw, 1000 / timesPerSecond);
          }
        ]);

      });
    }

    async.waterfall([
      function(next) {
        doScrollTo("processing-data", false, next);
      },
      function(next) {
        setTimeout(poll, 0);
      }
    ]);

  });

})($, _);