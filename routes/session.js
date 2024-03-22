const express = require("express");
const router = express.Router();
const checkAuth = require("../middlewares/auth");



router.get("/",checkAuth,(async (req,res)=>{
    return res.status(200).json({
        message:'you are logged in',
    })
}));

module.exports = router;