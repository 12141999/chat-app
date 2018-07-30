var mongoose = require("mongoose");
var passportLocalMongoose  = require("passport-local-mongoose");


var UserSchema = new mongoose.Schema({
  username : String,
  password : String,
  mobileno : Number,
  email : String,
  address : String
});


UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User" , UserSchema);