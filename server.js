function wordWork(word) {
  var startChars = "";
  var endChars = "";
  var okChars = "abcdefghijklmnopqrstuvwxyz0123456789";
  var i = 0;
  while (i < word.length) {
    if(_s.contains(okChars, word[i])) {
      startChars = word.substring(0, i);
      word = word.substring(i);
      break;
    }
    i++;
  }
  var i = word.length - 1;
  while (i >= 0) {
    if(_s.contains(okChars, word[i])) {
      endChars = word.substring(i + 1);
      word = word.substring(0, i + 1);
      break;
    }
    i--;
  }
  return {
    "start": startChars,
    "main": word,
    "end": endChars
  }
}

function cleanTweet(tweet) {

  //these words are removed completely
  var badWords = [];
  //these words are replaced
  var replacementWords = [
    // ["this", "that"]
  ];
  //mentions configuration
  var removeMentions = false;
  //go
  var text = tweet.text;
  //unescape HTML (&lt;3 becomes <3, etc.)
  //(risky! outputs bad JSON!?)
  //text = _s.unescapeHTML(text);
  //split
  var words = text.split(" ");
  var isRetweet = false;
  //retweet tweak: we don't care whom they're retweeting
  //but we do care that it's a retweet
  if (words[0] == "RT") {
    words.shift(); //RT
    words.shift(); //@xyz
    isRetweet = true;
  }
  //remove .@ colloquialism
  if (_s.startsWith(words[0], ".@")) words[0] = words[0].substring(1);
  //initial filters
  words = _.filter(words, function(word) {
    //remove blanks
    if (!word.length) return false;
    //remove links
    if (_s.startsWith(word, "http")) return false;
    //remove emoticons
    if (_s.startsWith(word, ":") || _s.startsWith(word, ";")) return false;
    //remove bad words
    if (_.contains(badWords, word)) return false;
    //remove mentions?
    if (removeMentions && _s.startsWith(word, "@")) return false;
    return true;
  });
  //map mentions
  var mentions = _.map(tweet.entities.user_mentions, function(mention) {
    return {
      "screen_name": mention.screen_name,
      "name": mention.name
    }
  });
  //find mentions break point (where the mentions from the start, stop)
  var increaseMentionsBreakPoint = true;
  var mentionsBreakPoint = 0;
  words = _.map(words, function(word, index) {
    if (increaseMentionsBreakPoint && _s.startsWith(word, "@")) {
      mentionsBreakPoint++;
    } else {
      increaseMentionsBreakPoint = false;
    }
    //remove emphasis
    //to do: use loop back function to remove rubbish at the end
    if (_s.startsWith(word, "*")) {
      word = word.substring(1);
    }
    if (_s.endsWith(word, "*")) {
      word = word.substring(0, word.length - 1);
    }
    if (word[word.length - 2] == "*") {
      word = word.substring(0, word.length - 2);
    }
    //elegantly handle hashtags
    if (_s.startsWith(word, "#")) {
      //remove hash
      word = word.substring(1);
      //humanise
      word = _s.humanize(word);
      //indicate it was a hashtag
      word = "(" + word + ")";
    }
    //replace words
    _.each(replacementWords, function(replacementWord) {
      if (word == replacementWord[0]) word = replacementWord[1];
    });
    //change mention screen name to name
    if (_s.startsWith(word, "@")) {
      //remove @
      word = word.substring(1);
      //to do: use loop back function to remove rubbish at the end
      //hack to remove punctuation at the end
      var wordEnd = word[word.length - 1];
      if (
        wordEnd == "." ||
        wordEnd == "!" ||
        wordEnd == "," ||
        wordEnd == ":" ||
        wordEnd == ";"
      ) word = word.substring(0, word.length - 1);
      var mention = _.find(mentions, function(mention) {
        return (word == mention.screen_name);
      });
      word = (mention ? mention.name : word);
    }
    return word;
  });
  //work with the mentions break point
  if (mentionsBreakPoint == 1) {
    words[0] += ",";
  } else if (mentionsBreakPoint > 1) {
    words.splice(mentionsBreakPoint, 0, "-");
  }
  //no words (probably just posted a picture) - not useful
  if (!words.length) return null;
  //rebuild from words
  var text = words.join(" ");
  //always end in a full stop (or an exclamation mark)
  var textEnd = text[text.length - 1];
  if (!((textEnd == ".") || (textEnd == "!"))) text += ".";
  //debug
  // console.log("Sentence: " + text);
  // console.log("Breakpoint: " + mentionsBreakPoint);
  // _.each(words, function(word, index) {
  //   console.log(word);
  // });
  //return
  return {
    "date": tweet.created_at,
    "text": text,
    "is_retweet": isRetweet,
    // "hashtags": _.map(tweet.entities.hashtags, function(hashtag) {
    //   return hashtag.text;
    // }),
    // "reply_to": tweet.in_reply_to_screen_name
  };
}

// "Standard" Modules
var low = require("lowdb");
var url = require("url");
var async = require("async");
var fs = require("fs");
var _ = require("underscore");
var _s = require("underscore.string");
var request = require('request');
var twitter = require('twitter');

// "Custom" Modules/Models
var serverSideMuseum = require("./models-server/museum.js");
var exhibition = require("./models/exhibition.js");
var exhibit = require("./models/exhibit.js");
var yans = require("yans");

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

    server.app.get("/favicon.ico", function(req, res) {
      res.redirect(301, "static/favicon.ico");
    });

    //
    // BACKEND (API) ROUTES
    //

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
                "account": {
                  "screenName": data.screen_name,
                  "name": data.name,
                  "location": data.location,
                  "description": data.description,
                  "language": data.lang,
                  "picture": data.profile_image_url
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
              var newData = passedData;
              var tweets = _.map(data, cleanTweet);
              //some tweets may have been removed (annulled)
              tweets = _.filter(tweets, function(tweet) {
                return (tweet != null);
              });
              newData.tweets = tweets;
              next(null, newData);
            }
          );

        },


        function(passedData, next) {
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