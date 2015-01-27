function twitterAccountElementFocus() {
  twitterAccountElement.focus();
  twitterAccountElement[0].selectionStart = 1;
  twitterAccountElement[0].selectionEnd = twitterAccountElement.val().length;
}

$(window).load(function() {

  window.twitterAccountElement = $("#twitter-account");
  twitterAccountElementFocus();

  $("#twitter-form").bind("submit", function() {
    var twitterAccountName = twitterAccountElement.val();
    if (twitterAccountName[0] == "@") twitterAccountName = twitterAccountName.substring(1);

    easyAjax("api/twitter/" + twitterAccountName, function(data) {
      if (!data) return;
      data = JSON.parse(data);
      var tweetObjects = data.twitter.tweets;
      var prose = $.map(tweetObjects, function(tweetObject) {
        return tweetObject.text;
      }).reverse().join(" ");
      console.log(prose);
      twitterAccountElementFocus();
    });
    return false;
  });

});