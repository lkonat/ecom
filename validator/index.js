
exports.userSignupValidator = (req,res,next)=>{
  req.check("name","Name is reqquired").notEmpty();
  req.check("email","valid email is required").matches(/.+\@.+\..+/).withMessage("email must contain @").isLength({min:4, max:32});
  req.check("password","password is required").notEmpty().isLength({min:6}).withMessage("password must be at least 6 characters");
  const errors = req.validationErrors();
  if(errors){
   const firstError = errors.map(error=>error.msg)[0];
   return res.status(400).json(firstError);
  }
  next();
}