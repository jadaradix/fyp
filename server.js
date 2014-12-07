var express = require("express");
var low = require("lowdb");
var url = require("url");
var async = require("async");
var fs = require("fs");
var _ = require("underscore");
var request = require('request');
var htmlToText = require('html-to-text');
var xml = require('xml2js');

var app = express();
var serverSideMuseum = require("./models/server-side-museum.js");
var exhibition = require("./models/exhibition.js");
var exhibit = require("./models/exhibit.js");

//
// GENERIC HELPERS
//

function resetDatabase() {
  var blankData = fs.readFileSync("db-blank.json");
  fs.writeFileSync("db.json", blankData);
  db = low("db.json");
  return true;
}

function getEntityById(lowdbKey, id, idKey) {
  if (id != 0 && !id) return null;
  var key = (idKey || "id");
  var selectObject = {};
  selectObject[key] = id;
  var entity = db(lowdbKey).find(selectObject).value();
  return entity;
}

function getExhibitFromTopic(name, callback) {
  var existingExhibit = getEntityById("exhibits", name, "name");
  var type, data, newExhibit;
  if (existingExhibit) {
    type = existingExhibit.type;
    data = existingExhibit.data;
    newExhibit = new exhibit.Instance(name, type, data);
    callback(newExhibit);
    return;
  } else {

    // Dummy algorithm

    type = "text";
    // var Dictionary = require('./dictionary');
    // var dict = new Dictionary({
    //   key: "16565cdc-11d8-4a1e-9c09-da2a3393892d"
    // });
    // dict.define(name, function(error, result) {
    //   data = result;
    //   // if (error == null) {
    //   //   data = result[0]["definition"][0]["_"];
    //   // } else {
    //   //   data = name + " isn't in the dictionary.";
    //   // }
    //   newExhibit = new exhibit.Instance(name, type, data);
    //   db("exhibits").push(newExhibit);
    //   db.save();
    //   callback(newExhibit);
    // });

    var options = {
      // url: "http://en.wikipedia.org/w/api.php?action=parse&prop=text&format=json&page=" + name,
      // url: "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/architecture?key=",
      // url: "http://en.wiktionary.org/w/api.php?action=parse&format=json&prop=text&page=" + name
      method: "GET"
    };
    function done(data) {
      var newExhibit = new exhibit.Instance(name, type, data);
      db("exhibits").push(newExhibit);
      db.save();
      callback(newExhibit);
    }
    var data = "Information about " + name.charAt(0).toUpperCase() + name.slice(1) + "...";
    done(data);
    // request(options, function(error, response, body) {
    //   var data = "";
    //   if (!error && response.statusCode == 200) {
    //     // xml.parseString(JSON.parse(body)["parse"]["text"]["*"], function(error, result) {
    //     //   data = result;
    //     //   newExhibit = new exhibit.Instance(name, type, data);
    //     //   done(newExhibit);
    //     // });
    //     // data = JSON.parse(body)["parse"]["text"]["*"];
    //     // newExhibit = new exhibit.Instance(name, type, data);
    //     // done(newExhibit);
    //     // var pages = JSON.parse(body)["query"]["pages"];
    //     // data = pages[Object.keys(pages)[0]]["revisions"][0]["*"];
    //     // data = htmlToText.fromString();
    //     data = name.charAt(0).toUpperCase() + name.slice(1) + " is blah.";
    //   } else {
    //     data = name.charAt(0).toUpperCase() + name.slice(1) + " is something not on Wikipedia. FML.";
    //     done(data);
    //   }
    // });
  }

}

//
// SERVE HELPERS
//

function serveFile(file, res) {
  console.log("-> Serving '%s'", file);
  console.log();
  file = __dirname + "/build/" + file;
  res.sendFile(file);
}

function serveJSON(json, res) {
  console.log("-> Serving JSON");
  console.log();
  res.send(json);
}

function getParameters(req) {
  var urlParts = url.parse(req.url, true);
  var hrefParts = urlParts.href.split("/").splice(1);
  var getParts = urlParts.query;
  return hrefParts.slice(1);
}

function beginApiCall(req) {
  var parameters = getParameters(req);
  console.log("API call: %s", JSON.stringify(parameters));
  return parameters;
}

function serveJSONNoFind(res) {
  res.status(404);
  serveJSON({
    "error": "I didn't find that."
  }, res);
}

//
// ROUTES
//

app.get("/favicon.ico", function(req, res) {
  console.log("Favicon request: favicon.ico");
  serveFile("static/favicon.ico", res);
});

app.get("/api/museum/*", function(req, res) {
  var parameters = beginApiCall(req);
  var container = getEntityById("containers", parseInt(parameters[1]));
  if (!container) {
    serveJSONNoFind(res);
    return;
  }
  var topicOn = 0;
  var topicCount = container.topics.length;
  var exhibits = [];
  function aTopicDone(exhibit) {
    exhibits.push(exhibit);
    topicOn += 1;
    if (topicOn == topicCount) allTopicsDone();
  }
  function allTopicsDone() {
    console.log("There are %d exhibits", exhibits.length);
    var exhibitionsCount = ((exhibits.length - (exhibits.length % 5)) / 5) + 1;
    var exhibitions = new Array(exhibitionsCount);
    var i = 0;
    for (i = 0; i < exhibitionsCount; i++) {
      var lExhibits = exhibits.slice(i * 5, (i * 5) + 5);
      exhibitions[i] = new exhibition.Instance(lExhibits);
    }
    var museum = new serverSideMuseum.Instance(container.name, exhibitions);
    serveJSON(museum, res);
  }
  _.each(container.topics, function(topic) {
    getExhibitFromTopic(topic, aTopicDone);
  });
});

app.get("/api/reset", function(req, res) {
  var parameters = beginApiCall(req);
  if (resetDatabase()) {
    serveJSON({
      "success": "The database was reset."
    }, res);
  } else {
    serveJSON({
      "error": "The database was not reset."
    }, res);
  }
});

app.get(/^(.+)$/, function(req, res) {
  var r = req.params[0].substring(1);
  if (r.length == 0) r = "index.html";
  console.log("Static file request: '%s'", r);
  if (fs.existsSync(__dirname + "/build/" + r)) {
    serveFile(r, res);
  } else {
    res.status(404);
    serveFile("404.html", res);
    return;
  }
});

//
// BEGIN
//

var db;
if (!fs.existsSync("db.json")) {
  resetDatabase();
} else {
  db = low("db.json");
}

var port = 80;
app.listen(port, function() {
  console.log("Hi. Server is running on port %d!", port);
  console.log();
});