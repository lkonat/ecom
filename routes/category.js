const express = require('express');
const router = express.Router();
const {userById} = require("../controllers/user");
const {create} = require("../controllers/category");
const {requireSignin,isAuth,isAdmin} = require("../controllers/auth");
router.post('/category/create/:userId',requireSignin,isAuth,isAdmin,create);
router.param("userId",userById);
module.exports = router;