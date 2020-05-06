const User = require("../models/user");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
exports.signin = async(req,res)=>{
  const {email, password} = req.body;
  let connection = await User.open();
  if(!connection.err){
    User.chechEmail({
      email:email
    }).then((user)=>{
      if(user){
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err){
            return res.status(400).json({err:err.toString()});
          }
          if (isMatch) {
            const token = jwt.sign({id:user.id},process.env.JWT_SECRET);
            //persist the token as 't' in cookie with expiring date
            res.cookie('t',token,{expire:new Date()+9999});
            //return response to user and frontend client
            const {id,email,name} = user;
            return res.json({token, user:{id,email,name}});
          } else {
            return res.status(400).json({err:"password does not match"});
          }
        });
      }else{
        return res.status(400).json({err:"user does not exist"});
      }
    });
  }else{
    return res.json({err:'error while creating database connection'});
  }
};
exports.signout = (req,res)=>{
  res.clearCookie("t");
  res.json({message:"sign out successfull"});
}

exports.requireSignin = expressJwt({
  secret:process.env.JWT_SECRET,
  userProperty:"auth"
});
exports.signup = async(req,res)=>{
    let connection = await User.open();
    if(!connection.err){
      const { name, email, password, password2 } = req.body;
      let errors = [];
    
      if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
      }
      if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
      }
      if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
      }
    
      if (errors.length > 0) {
        res.json({
            errors:errors,
            name:name,
            email:email,
            password:password,
            password2:password2
        });
      } else {
        User.chechEmail({email:email}).then(user => {
          if (user) {
            errors.push({ msg: 'Email already exists' });
            res.json({
              errors:errors,
              name:name,
              email:email,
              password:password,
              password2:password2
            });
          } else {
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err;
                User.addUser({
                    name:name,
                    email:email,
                    hash:hash
                }).then(user => {
                    res.json({registered:true});
                }).catch((err )=>{
                    res.json({err:err});
                });
              });
            });
          }
        });
      }
    }else{
      res.json({err:'error while creating database connection'});
    }
};
exports.isAuth = (req,res, next)=>{
  let user = req.profile && req.auth && req.profile.id == req.auth.id;
  if(!user){
    return res.status(403).json({err:"access denied"});
  }
  next();
};

exports.isAdmin = (req,res, next)=>{
  if(req.profile.role === 0){
    return res.status(403).json({
      err:'Admin ressource! access denied'
    });
  }
  next();
};