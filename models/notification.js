const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobLocation: {
      type: String,
      required: true,
    },
    viewedBy:[
      {
        type: Schema.Types.ObjectId,
        ref: "Device",
      },
    ],
    Devices: [
      {
        type: Schema.Types.ObjectId,
        ref: "Device",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
