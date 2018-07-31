var mongoose = require("mongoose");

var MessageSchema = new mongoose.Schema({
 /* room : String,*/
  handle : String,
  message : String,
  room : String
});

module.exports = mongoose.model("Message" , MessageSchema);			

