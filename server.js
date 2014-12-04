var express = require("express");
var low = require("lowdb");
var url = require("url");
var async = require("async");
var fs = require("fs");
var _ = require("underscore");

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
  } else {
    // Dummy algorithm
    type = "text";
    data = name.charAt(0).toUpperCase() + name.slice(1) + " is something cool. Hell yeah.";
    newExhibit = new exhibit.Instance(name, type, data);
    db("exhibits").push(newExhibit);
    db.save();
  }
  callback(newExhibit);
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