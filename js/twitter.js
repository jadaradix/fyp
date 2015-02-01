function twitterAccountElementFocus() {
  twitterAccountElement.focus();
  twitterAccountElement[0].selectionStart = 1;
  twitterAccountElement[0].selectionEnd = twitterAccountElement.val().length;
}

function objectsToCSV(dObjects, fields, writeIndex) {

  var csv = "";
  $.each(dObjects, function(index, dObject) {
    var fieldValues = [];
    if (writeIndex) fieldValues.push(index.toString());
    var mappedFieldValues = $.map(fields, function(field) {
      return dObject[field].replace(/,/g, " ");
    });
    fieldValues = fieldValues.concat(mappedFieldValues);
    var csvRow = fieldValues.join(",");
    csv += csvRow + "\n";
  });
  return csv;

}

$(window).load(function() {

  window.twitterAccountElement = $("#twitter-account");
  twitterAccountElementFocus();

  $("#twitter-form").bind("submit", function() {
    var twitterAccountName = twitterAccountElement.val();
    if (twitterAccountName[0] == "@") twitterAccountName = twitterAccountName.substring(1);

    easyAjax("api/twitter/" + twitterAccountName, function(data) {
      if (!data) return;
      data = JSON.parse(data)["twitter"]["tweets"];
      var csv = objectsToCSV(
        data,
        ["text"],
        true
      );
      console.log(data);
      console.log(csv);
      twitterAccountElementFocus();
    });
    return false;
  });

});