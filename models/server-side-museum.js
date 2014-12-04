function ServerSideMuseum(name, exhibitions) {
  var _self = this;
  _self.name = (name || "A Museum");
  _self.exhibitions = (exhibitions || []);
}

// Export
module.exports = {
  "Instance": ServerSideMuseum
};