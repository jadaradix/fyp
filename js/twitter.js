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

    doScrollTo("fetching");

    easyAjax("api/twitter/" + twitterAccountName, function(data) {
      if (!("error" in data)) {
        doScrollTo("fetching-ok");
        setTimeout(
          function() {
            window.location = "process/" + twitterAccountName;
          },
          2500
        );
      } else {
        $("#twitter-error").html(data["error"]);
        doScrollTo("fetching-error");
        twitterAccountElementFocus();
        setTimeout(
          dScrollTop,
          1000
        );
      }
    });

    return false;

  });

});