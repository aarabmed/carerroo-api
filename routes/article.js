const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/auth");
const { WithPublicSession } = require("../utils/session");

const {
  updateArticle,
  createArticle,
  onSearch,
  getArticle,
  getAllArticles,
  deleteArticle,
  getFavoriteArticles,
  searchPreview
} = require("../controllers/article");

router.get("/", getAllArticles);

router.get("/get/:id", getArticle);

router.get("/favorite", getFavoriteArticles);

router.get("/search", onSearch);

router.get ("/search-preview",searchPreview)

router.post("/new", checkAuth,createArticle);

router.patch("/delete/:id", checkAuth, deleteArticle);

router.patch("/:id",checkAuth, updateArticle);


module.exports = router;
