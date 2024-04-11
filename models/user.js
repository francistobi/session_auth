const mongoose = require("mongoose");
const passwordLocalMongoose = require("passport-local-mongoose");

const userModel = new mongoose.Schema({
  username: String,
  password: String,
});

mongoose.plugin(passwordLocalMongoose);

module.exports = mongoose.model("user",userModel);
