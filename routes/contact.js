const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/auth");
const  { newEmail }= require('../controllers/contact')

router.post("/new", newEmail);


module.exports = router;