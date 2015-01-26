/*!
 * twinglish
 * Copyright(c) 2015 James Garner
 * MIT Licensed
 */

var _ = require("underscore");
var _s = require("underscore.string");

function twinglish() {

  var _self = this;


  _self.wordWork = function(word) {
    var startChars = "";
    var endChars = "";
    var okChars = "abcdefghijklmnopqrstuvwxyz0123456789#@";
    var tWord = word.toLowerCase();
    var i = 0;
    while (i < tWord.length) {
      if(_s.contains(okChars, tWord[i])) {
        startChars = word.substring(0, i);
        word = word.substring(i);
        break;
      }
      i++;
    }
    var i = tWord.length - 1;
    while (i >= 0) {
      if(_s.contains(okChars, tWord[i])) {
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
    var words = tweet.text.split(" ");

    //remove rt: we don't care whom they're retweeting
    //but we do care that it's a retweet
    if (words[0] == "RT") {
      words.shift(); //RT
      words.shift(); //@xyz
      r.isRetweet = true;
    }

    //remove .@ colloquialism
    if (_s.startsWith(words[0], ".@")) words[0] = words[0].substring(1);

    //...

    //no words (probably just posted a picture) - not useful
    if (!words.length) return null;

    //rebuild from words
    var text = words.join(" ");

    //always end in a full stop (or an exclamation mark)
    var textEnd = text[text.length - 1];
    if (!((textEnd == ".") || (textEnd == "!"))) text += ".";

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