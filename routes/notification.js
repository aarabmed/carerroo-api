const express = require("express");
const router = express.Router();

const {sendNotifications, getNotifications} = require("../controllers/notification");

router.get("/:token", getNotifications);
router.post("/send", sendNotifications);

module.exports = router; 
