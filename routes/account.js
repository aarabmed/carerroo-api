const express = require("express");
const checkAuth = require("../middlewares/auth")
const router = express.Router();
const {WithuAuthSession} = require('../utils/session')

const {userLogin,updateUserPassword,userLogout,signUp} = require('../controllers/account')



router.post('/login',WithuAuthSession(userLogin));
router.patch('/new_password/:id',checkAuth,updateUserPassword);
router.get('/logout',WithuAuthSession(userLogout));
router.post('/signup', signUp);



module.exports = router;