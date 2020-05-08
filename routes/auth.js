const express = require('express');
const router = express.Router();
const { signup,signin,signout ,requireSignin} = require("../controllers/auth");
const {userSignupValidator,userSigninValidator}  = require("../validator/index.js");
router.post('/signup',userSignupValidator,signup);
router.post('/signin',userSigninValidator,signin);
router.post('/signout',signout);
router.post('/hello',requireSignin,(req,res)=>{
    res.json('hello');
});
module.exports = router;