const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/auth");

const {
  getCategory,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category");

router.get("/", getAllCategories);

router.get("/:id", getCategory);

router.post("/new", checkAuth, createCategory);

router.patch("/:id", checkAuth, updateCategory);

router.patch("/delete/:id", checkAuth, deleteCategory);

module.exports = router;
