// Emulate Enumeration
var exhibitTypes = {
  "picture": 0,
  "video": 2,
  "text": 1,
};

function Exhibit(name, type, data) {

  var _self = this;

  _self.name = (name || "Room");
  _self.type = (type || exhibitTypes.text);
  _self.data = (data || null);

}

// Export
module.exports = {
  "exhibitTypes": exhibitTypes,
  "Instance": Exhibit
};