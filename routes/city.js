const express = require("express");
const checkAuth = require("../middlewares/auth");
const router = express.Router();
const { WithuAuthSession } = require("../utils/session");

const {
  createCity,
  getAllCities,
  getSingleCity,
} = require("../controllers/city");

router.get("/", getAllCities);
/* router.post('/add',createCity);
router.get('/:id',getSingleCity); */

module.exports = router;
