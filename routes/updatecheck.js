const express = require("express");
const Version = require("../models/update") 
const router = express.Router();

router.get("/", async (req, res, next)=>{
    const latestUpdate = await Version.findById('6557a8ad7c62ca2f654caa7d')
    if(latestUpdate){
        return res.status(200).json({
            data:latestUpdate,
            message:"latest version has been found",
          });
    }else{
        return res.status(500).json({
            data:null,
            message:"error while retrieving the latest version",
          });
    }
});


module.exports = router;