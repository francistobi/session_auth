require("dotenv").config();
const mongoose = require("mongoose");

function connectToMongodb(url) {
  return mongoose.connect(url)
}
module.exports = { connectToMongodb };