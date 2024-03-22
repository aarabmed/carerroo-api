const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const PositionType = mongoose.Schema({
  lat: { type: String },
  lon: { type: String },
});


//!============= City
const provinceSchema = new Schema(
  {
    name: {
      type: String,
    },
    state_code: {
      type: Number,
    },
    term:{
      type:String
    },
    position: {
      type: PositionType,
    },
    status: {
      type: Boolean,
    },
    cities:[{
        type: Schema.Types.ObjectId,
        ref: "City",
    }],
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

module.exports=mongoose.model('Province',provinceSchema)