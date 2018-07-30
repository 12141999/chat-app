var mongoose = require("mongoose");

var RoomSchema = new mongoose.Schema({
  room : String
});

module.exports = mongoose.model("Room" , RoomSchema);