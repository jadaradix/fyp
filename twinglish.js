/*!
 * twinglish
 * Copyright(c) 2015 James Garner
 * MIT Licensed
 */

var _ = require("underscore");
var _s = require("underscore.string");

function twinglish() {

  var _self = this;
  _self.okChars = "abcdefghijklmnopqrstuvwxyz0123456789#@";


  _self.wordWork = function(word) {
    var startChars = "";
    var endChars = "";
    
    var tWord = word.toLowerCase();
    var i = 0;
    while (i < tWord.length) {
      if(_s.contains(_self.okChars, tWord[i])) {
        startChars = word.substring(0, i);
        word = word.substring(i);
        break;
      }
      i++;
    }
    var i = tWord.length - 1;
    while (i >= 0) {
      if(_s.contains(_self.okChars, tWord[i])) {
        endChars = word.substring(i + 1);
        word = word.substring(0, i + 1);
        break;
      }
      i--;
    }
    return {
      "start": startChars,
      "main": _s.clean(word),
      "end": endChars
    }
  }


  _self.cleanTweet = function(tweet) {

    //returnable object
    var r = {
      "originalText": tweet.text,
      "text": "",
      "date": tweet.created_at,
      "isRetweet": false,
      "hashtags": []
    };

    //map mentions
    var mentions = _.map(tweet.entities.user_mentions, function(mention) {
      return {
        "screen_name": mention.screen_name,
        "name": mention.name
      }
    });

    //words
    var words = tweet.text
      .replace(/\n/gi, " ")
      .replace(/\r/gi, " ")
      .replace(/\t/gi, " ")
      .split(" ");

    //remove rt: we don't care whom they're retweeting
    //but we do care that it's a retweet
    if (words[0] == "RT") {
      words.shift(); //RT
      words.shift(); //@xyz
      r.isRetweet = true;
    }

    //remove .@ colloquialism
    if (_s.startsWith(words[0], ".@")) words[0] = words[0].substring(1);

    var wordObjects = _.map(words, function(word) {
      return _self.wordWork(word);
    });

    //single character optimisation
    _.each(wordObjects, function(wordObject, index) {
      if (wordObject.main.length == 1) {
        var tOkChars = _self.okChars.concat(["-", "="]);
        if (!(_s.contains(tOkChars, wordObject.main.toLowerCase()))) {
          if (wordObjects[index - 1]) wordObjects[index - 1].main += wordObject.main;
          wordObject.main = "";
        }
      }
    });

    //initial filters
    wordObjects = _.filter(wordObjects, function(wordObject) {
      //remove blanks
      if (wordObject.main.length == 0) return false;
      //remove links
      if (_s.startsWith(wordObject.main, "http")) return false;
      //remove emoticons
      if (_s.startsWith(wordObject.main, ":") || _s.startsWith(wordObject.main, ";")) return false;
      //remove bad words
      // if (badWords) {
      //   if (_.contains(badWords, wordObject.main)) return false;
      // }
      return true;
    });

    //find mentions break point (where the mentions from the start, stop)
    var increaseMentionsBreakPoint = true;
    var mentionsBreakPoint = 0;
    _.each(wordObjects, function(wordObject, index) {
      if (increaseMentionsBreakPoint && _s.startsWith(wordObject.main, "@")) {
        mentionsBreakPoint++;
      } else {
        increaseMentionsBreakPoint = false;
      }
    });

    wordObjects = _.map(wordObjects, function(wordObject, index) {
      //elegantly handle hashtags
      if (_s.startsWith(wordObject.main, "#")) {
        //remove hash
        wordObject.main = wordObject.main.substring(1);
        //keep abbreviations
        if (wordObject.main === wordObject.main.toUpperCase()) {
          wordObject.main = wordObject.main.toUpperCase();
        } else {
          //humanise
          wordObject.main = _s.humanize(wordObject.main);
        }
        //indicate it was a hashtag
        wordObject.main = "(" + wordObject.main + ")";
      }
      //change mention screen name to name
      if (_s.startsWith(wordObject.main, "@")) {
        //remove @
        wordObject.main = wordObject.main.substring(1);
        var mention = _.find(mentions, function(mention) {
          return (wordObject.main == mention.screen_name);
        });
        wordObject.main = (mention ? mention.name : wordObject.main);
      }
      return wordObject;
    });

    //work with the mentions break point
    var i = 0;
    while (i < mentionsBreakPoint - 1) {
      wordObjects[i].main += ",";
      i++;
    }
    if (mentionsBreakPoint > 0) {
      wordObjects.splice(mentionsBreakPoint, 0, {
        "start": "",
        "main": "-",
        "end": ""
      });  
    }

    //no words (probably just posted a picture) - not useful
    if (!wordObjects.length) return null;

    //rebuild from words
    var text = _.map(wordObjects, function(wordObject) {
      var t = wordObject.start + wordObject.main + wordObject.end;
      return t;
      // if (wordObject.end == "."
      // ||  wordObject.end == "?"
      // ||  wordObject.end == ","
      // ||  wordObject.end == ";"
      // ||  wordObject.end == "!") t += wordObject.end;
    }).join(" ");

    //always end in a full stop (or an exclamation mark)
    var textEnd = text[text.length - 1];
    if (!(
         (textEnd == ".")
      || (textEnd == "!")
      || (textEnd == "?")
    )) text += ".";

    //text
    r.text = text;

    //hashtags
    r.hashtags = _.map(tweet.entities.hashtags, function(hashtag) {
      return hashtag.text;
    });

    //reply to
    //r.replyTo = tweet.in_reply_to_screen_name;

    //return
    return r;

  }


}

module.exports = {
  "Instance": twinglish
};