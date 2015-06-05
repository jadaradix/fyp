// NPM Modules
var low = require("lowdb");
var url = require("url");
var async = require("async");
var fs = require("fs");
var _ = require("underscore");
var _s = require("underscore.string");
var request = require('request');
var twitter = require('twitter');

// Custom Modules
var yans = require("./node_modules-custom/yans");
var twinglish = require("./node_modules-custom/twinglish.js");
var twetrics = require("./node_modules-custom/twetrics.js");
var csv = require("./node_modules-custom/csv.js");
var dataer = require("./node_modules-custom/dataer.js");

var twitterClient;
var server;
async.waterfall([


  function(next) {

    // SERVER

    server = new yans({
      "directory": __dirname,
      "viewPath": "pages",
      "logging": true,
      "loggingFormat": ":method :url -> HTTP :status; :response-time ms",
      "staticDirectories": ["css", "fonts", "js", "static"]
    });

    server.dbInit = function() {
      var _self = this;
      _self.db = low(
        "db.json",
        {
          "autosave": false
        }
      );
    }

    server.resetDatabase = function(callback) {
      var _self = this;
      var blankData = fs.readFileSync("db-blank.json");
      fs.writeFileSync("db.json", blankData);
      _self.dbInit();
      callback();
    };

    server.jsonError = function(text, res) {
      res.send({
        "error": text
      });
    };

    server.jsonSuccess = function(text, res) {
      res.send({
        "ok": text
      });
    };

    next();

  },


  function(next) {

    // DATABASE

    if (!fs.existsSync("db.json")) {
      server.resetDatabase(next);
    } else {
      server.dbInit();
      next();
    }

  },


  function(next) {

    // TWITTER

    fs.readFile("twitter-credentials.json", function(error, data) {
      if (error) {
        console.error("twitter-credentials.json is missing or couldn't be read. I need this.");
        process.exit();
        return;
      }
      var twitterDetails = JSON.parse(data);
      twitterClient = new twitter(twitterDetails);
      next();
    });

  },


  function(next) {

    //
    // FRONTEND (UI) ROUTES
    //

    server.app.get("/", function(req, res) {
      res.render("index");
    });

    server.app.get("/twitter/", function(req, res) {
      var twitter = "jadaradix";
      res.render(
        "twitter",
        { "twitter": twitter }
      );
    });

    server.app.get("/twitter/*/", function(req, res) {
      var twitter = req.params[0];
      res.render(
        "twitter",
        { "twitter": twitter }
      );
    });

    server.app.get("/process/", function(req, res) {
      if (!req.query.hasOwnProperty("name") || !req.query.hasOwnProperty("topics")) {
        res.redirect(302, "/");
        return;
      }
      var name  = _s.humanize(req.query.name) + " Museum";
      var topics = req.query.topics.split(",");
      var museums = server.db("museums");
      //insert
      function doesIdExist(id) {
        var r = museums.find({ id: id });
        return (r.value() ? true : false);
      }
      function generateId() {
        var id = _.times(16, function(n) {
          return _.random(0, 10);
        }).join("");
        return id;
      }
      var id = generateId();
      while (doesIdExist(id)) {
        var id = generateId();
      }
      var museum = {
        "id": id,
        "name": name,
        "isSpontaneous": true,
        "topics": topics
      }
      museums.push(museum);
      server.db.save();
      res.redirect(302, "/museum/" + id);
    });

    server.app.get("/process/*/", function(req, res) {
      var id = req.params[0];
      var museums = server.db("museums");
      var r = museums.find({
        id: id
      });
      var rValue = r.value();
      if (!rValue) {
        res.redirect(302, "/twitter/" + id);
        return;
      }
      res.render(
        "process",
        { "twitter": id }
      );
    });

    server.app.get("/museum/*/", function(req, res) {
      var id = req.params[0];
      var museums = server.db("museums");
      var r = museums.find({
        id: id
      });
      var rValue = r.value();
      if (!rValue || (!(("topics" in rValue)) || rValue.topics.length == 0)) {
        res.redirect(302, "/twitter/" + id);
        return;
      }
      res.render(
        "museum",
        {
          "title": rValue.name,
          "id": id
        }
      );
    });

    server.app.get("/favicon.ico", function(req, res) {
      res.redirect(301, "/static/favicon.ico");
    });

    //
    // BACKEND (API) ROUTES
    //

    server.app.get("/api/reset", function(req, res) {
      async.waterfall([
        function(next) {
          server.resetDatabase(next);
        },
        function(next) {
          server.jsonSuccess("The database was reset.", res);
        }
      ]);
    });

    server.app.get("/api/twitter/*", function(req, res) {

      var screenName = req.params[0];
      if (!screenName.length) {
        server.jsonError("The Twitter screen name was empty.", res);
        return;
      }

      async.waterfall([

        function(next) {

          // Account
          twitterClient.get(
            'users/show',
            {
              "screen_name": screenName,
            },
            function(error, data, raw) {
              if (error) {
                var errorText;
                switch(error.statusCode) {
                  case 404:
                    errorText = "That Twitter account doesn't exist.";
                    break;
                  default:
                    errorText = "The twitter account couldn't be accessed; that's all.";
                    break;
                }
                server.jsonError(errorText, res);
                return;
              }
              var newData = {
                "id": screenName,
                "name": data.name + "'" + (!_s.endsWith(data.name.toLowerCase(), "s") ? "s" : "") + " Museum",
                "isSpontaneous": false,
                "twitter": {
                  "account": {
                    "screenName": data.screen_name,
                    "name": data.name,
                    "location": data.location,
                    "description": data.description,
                    "language": data.lang,
                    "picture": data.profile_image_url
                  }
                }
              };
              next(null, newData);
            }
          );

        },

        function(passedData, next) {

          twitterClient.get(
            'statuses/user_timeline',
            {
              "screen_name": screenName,
              "trim_user": true,
              "count": 200,
              "include_rts": true
            },
            function(error, data, raw) {
              if (error) {
                var errorText;
                switch(error.statusCode) {
                  case 401:
                    errorText = "That Twitter account is probably using &lsquo;protected tweets&rsquo;.";
                    break;
                  default:
                    errorText = "The tweets couldn't be retrieved; that's all.";
                    break;
                }
                server.jsonError(errorText, res);
                return;
              }
              var tweets = _.map(data, twinglish.cleanTweet);
              // var tweets = data;
              //some tweets may have been removed (annulled)
              tweets = _.filter(tweets, function(tweet) {
                return (!(tweet == null || tweet == undefined)); //sorry
               });
              passedData["twitter"]["tweets"] = tweets;

              var tweetTexts = _.map(tweets, function(tweet) {
                return tweet.text;
              });
              var textStuff = tweetTexts.join(" ");

// from http://codereview.stackexchange.com/questions/63947/count-frequency-of-words-in-a-string-returning-list-of-unique-words-sorted-by-fr
function getFrequency2(string, cutOff) {
  var cleanString = string.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,""),
      words = cleanString.split(' '),
      frequencies = {},
      word, frequency, i;

  for( i=0; i<words.length; i++ ) {
    word = words[i];
    frequencies[word] = frequencies[word] || 0;
    frequencies[word]++;
  }
  
  words = Object.keys( frequencies );

  return words.sort(function (a,b) { return frequencies[b] -frequencies[a];}).slice(0,cutOff);
}

              var stuff = getFrequency2(textStuff, 100);

              var stuff2 = stuff.slice(95, 100);
              console.log(stuff2);

              passedData["topics"] = stuff2;
              next(null, passedData);
            }
          );

        },


        function(passedData, next) {
          if ("metrics" in req.query) {
            passedData["twitter"]["metrics"] = _.map(twetrics.metrics, function(metric) {
              return metric.method(passedData["twitter"]["tweets"]);
            });
          }
          next(null, passedData);
        },


        function(passedData, next) {
          var format = (("format" in req.query) ? req.query.format : "json");
          var data;
          switch(format) {
            case "store":
              var museums = server.db("museums");
              var r = museums.remove({
                id: screenName
              });
              // if (r["__wrapped__"].length == 0) {
              //   //did not exist in the first place
              //   return;
              // }
              museums.push(passedData);
              server.db.save();
              server.jsonSuccess("The Twitter data was stored.", res);
              return;
              break;
            case "json":
              data = passedData;
              break;
            case "prettyjson":
              data = JSON.stringify(passedData, undefined, 2);
              break;
            case "csv":
              //return only tweets
              data = csv.fromObjects(
                passedData["twitter"]["tweets"],
                ["when", "text", "isRetweet"],
                true
              );
              break;
            default:
              data = [];
              break;
          }
          res.send(data);
        }


      ]);



    });

    server.app.get("/api/process/*", function(req, res) {
      var museums = server.db("museums");
      var r = museums.find({
        id: req.params[0]
      }).value();
      if (!r) {
        server.jsonError("There's no data for this screen name. Stop hacking.", res);
        return;
      }
      res.send(r);
    });

    server.app.get("/api/museum/*", function(req, res) {
      var museums = server.db("museums");
      var r = museums.find({
        id: req.params[0]
      }).value();
      if (!r) {
        server.jsonError("There's no data for this screen name. Stop hacking.", res);
        return;
      }

      var topicFunctions = _.map(r.topics, function(topic) {
        return function(callback) {
          dataer.getData(topic, function(data) {
            callback(null, data);
          })
        };
      })

      async.parallel(
        topicFunctions,
        function(err, topics) {
          res.send({
            "isSpontaneous": (r.isSpontaneous ? true : false),
            "topics": topics
          });
        }
      );

    });

    //
    // ERROR CODE ROUTES
    //

    server.app.get("*", function(req, res) {
      res.status(404);
      res.render("404");
    });

  }


]);