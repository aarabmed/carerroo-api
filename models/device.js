const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const deviceSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    interestList: [
      {
        type: String,
      },
    ],
    status: {
      type: Boolean,
      default:true,
    },
    lastActiveDate:{
      type:Date,
      require:false
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("Device", deviceSchema);
