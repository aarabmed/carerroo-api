const express = require("express");
const checkAuth = require("../middlewares/auth")
const router = express.Router();
const {WithuAuthSession} = require('../utils/session')

const {createProvince,addCitiesToProvince, getAllProvinces, getSingleProvince} = require('../controllers/province')



router.get('/all',getAllProvinces);
router.post('/add',createProvince);
router.get('/:province',getSingleProvince);
router.patch('/:id',addCitiesToProvince);




module.exports = router;