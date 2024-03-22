const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const PositionType = mongoose.Schema({
  lat: { type: Number },
  lon: { type: Number },
});


//!============= City
const citySchema = new Schema(
  {
    name: {
      type: String,
    },
    state_code: {
      type: String,
    },
    position: {
      type: PositionType,
    },
    status: {
      type: Boolean,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports=mongoose.model('City',citySchema)