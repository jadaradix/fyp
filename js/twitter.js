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
      var csvTexts = $.map(tweetObjects, function(tweetObject) {
        return tweetObject.text.replace(/,/g, " ");
      }).reverse();
      var csv = "";
      $.each(csvTexts, function(index, csvText) {
        csv += index.toString() + "," + csvText + "\n";
      });
      console.log(csv);
      twitterAccountElementFocus();
    });
    return false;
  });

});