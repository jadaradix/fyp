var yans = require("yans");
var server = new yans({
  "directory": __dirname,
  "viewPath": "pages",
  "logging": true,
  "loggingFormat": ":method :url -> HTTP :status; :response-time ms",
  "staticDirectories": ["css", "fonts", "js", "static"]
});

var low = require("lowdb");
var url = require("url");
var async = require("async");
var fs = require("fs");
var _ = require("underscore");
var request = require('request');

var serverSideMuseum = require("./models-server/museum.js");
var exhibition = require("./models/exhibition.js");
var exhibit = require("./models/exhibit.js");

//
// ROUTES
//

server.app.get("/", function(req, res) {
  res.render("index");
});

server.app.get("/favicon.ico", function(req, res) {
  res.redirect(301, "static/favicon.ico");
});

//
// GENERIC HELPERS
//

function resetDatabase() {
  var blankData = fs.readFileSync("db-blank.json");
  fs.writeFileSync("db.json", blankData);
  db = low("db.json");
  return true;
}

var db;
if (!fs.existsSync("db.json")) {
  resetDatabase();
} else {
  db = low("db.json");
}