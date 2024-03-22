const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const dummySchema = new Schema(
  {
    fistName:{
      type: String
    },
    lastName:{
      type:String,
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("Test", dummySchema);
