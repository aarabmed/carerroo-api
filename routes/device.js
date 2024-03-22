const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/auth");

const { subscribeToNotification ,unsubscribeFromNotification,checkNotificationStatus} = require("../controllers/device");

router.post("/subscribe", subscribeToNotification);
router.post("/unsubscribe", unsubscribeFromNotification);
router.get("/check-device", checkNotificationStatus);
module.exports = router;
