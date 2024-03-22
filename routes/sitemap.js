const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/auth");

const { sitemapGenerator } = require("../controllers/article");

router.post("/generate", sitemapGenerator);

module.exports = router;
