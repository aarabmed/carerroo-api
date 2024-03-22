const express = require("express");


const checkAuth = require("../middlewares/auth")
const router = express.Router();

 const  {superAdmin,newUser, getUser ,getAllUsers , updateUser ,deleteUser ,upgradeUser ,downgradeUser ,setUserStatus }= require('../controllers/user')


router.get("/",checkAuth, getAllUsers);

router.get("/:id",checkAuth, getUser);

router.get("/check/superadmin", superAdmin);

router.post('/new_user',checkAuth, newUser);

router.patch("/:id",checkAuth, updateUser);

router.patch("/status/:id",checkAuth, setUserStatus);

router.patch("/upgrade/:id",checkAuth, upgradeUser);

router.patch("/downgrade/:id",checkAuth, downgradeUser);

router.patch("/delete/:id",checkAuth, deleteUser);

module.exports = router;