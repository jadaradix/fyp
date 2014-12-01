var express = require("express");
var low = require("lowdb");
var url = require("url");
var async = require("async");
var fs = require("fs");
var _ = require("underscore");

var app = express();
var db;

//
// GENERIC HELPERS
//

function resetDatabase() {
  var blankData = fs.readFileSync("db-blank.json");
  fs.writeFileSync("db.json", blankData);
  db = low("db.json");
}

function getUrlStuff(req) {
  var urlParts = url.parse(req.url, true);
  return {
    "hrefParts": urlParts.href.split("/").splice(1),
    "getParts": urlParts.query
  };
}

if (!fs.existsSync("db.json")) {
  resetDatabase();
} else {
  db = low("db.json");
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

function serveErrorCode(code, res) {
  res.status(code);
  serveFile(code.toString() + ".html", res);
}

//
// ROUTES
//

function apiHandle(req, res) {
  var urlStuff = getUrlStuff(req);
  var parameters = urlStuff.hrefParts.slice(1);
}

app.get("/favicon.ico", function(req, res) {
  serveFile("static/favicon.ico", res);
});

app.get("/api/museum/*", function(req, res) {
  serveJSON({}, res);
});

app.get(/^(.+)$/, function(req, res) {
  var r = req.params[0].substring(1);
  if (r.length == 0) r = "index.html";
  console.log("Static file: '%s'", r);
  if (fs.existsSync(__dirname + "/build/" + r)) {
    serveFile(r, res);
  } else {
    serveErrorCode(404, res);
    return;
  }
});

//
// BEGIN
//

var port = 80;
app.listen(port, function() {
  console.log("Hi. Server is running on port %d!", port);
  console.log();
});