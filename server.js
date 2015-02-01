// "Standard" Modules
var low = require("lowdb");
var url = require("url");
var async = require("async");
var fs = require("fs");
var _ = require("underscore");
var _s = require("underscore.string");
var request = require('request');
var twitter = require('twitter');

// "Custom" Modules
var yans = require("yans");
var twinglish = require("./twinglish.js");
var twinglishInstance = new twinglish.Instance();

// "Custom" Models
//...

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

    server.resetDatabase = function(callback) {
      var _self = this;
      var blankData = fs.readFileSync("db-blank.json");
      fs.writeFileSync("db.json", blankData);
      _self.db = low("db.json");
      callback();
    };

    server.jsonError = function(text, res) {
      res.send({
        "error": text
      });
    };

    server.jsonSuccess = function(text, res) {
      res.send({
        "success": text
      });
    };

    next();

  },


  function(next) {

    // DATABASE

    if (!fs.existsSync("db.json")) {
      server.resetDatabase(next);
    } else {
      server.db = low("db.json");
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

    server.app.get("/twitter", function(req, res) {
      res.render("twitter");
    });

    server.app.get("/process/*", function(req, res) {
      console.log(req);
      res.render(
        "process",
        {
          "museum": req.params[0]
        }
      );
    });

    server.app.get("/favicon.ico", function(req, res) {
      res.redirect(301, "static/favicon.ico");
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
              // console.log(error);
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
              // var tweets = _.map(data, function(tweet) {
              //   return twinglishInstance.cleanTweet(tweet, true, false, []);
              // });
              var tweets = _.map(data, twinglishInstance.cleanTweet);
              //some tweets may have been removed (annulled)
              tweets = _.filter(tweets, function(tweet) {
                return (tweet != null);
              });
              passedData["twitter"]["tweets"] = tweets;
              next(null, passedData);
            }
          );

        },


        function(passedData, next) {
          server.db("museums").push(passedData);
          server.db.save();
          res.send(JSON.stringify(passedData, undefined, 2));
          // res.send(passedData);
        }


      ]);



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