const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const roomSchema = new Schema({
  name: String,
  url: String,
  owner:Schema.Types.ObjectId
}, {
  timestamps: true
});

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;