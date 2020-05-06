const User = require("../models/user");
exports.userById = async( req,res,next,id)=>{
    let connection = await User.open();
  if(!connection.err){
      console.log(id);
    User.getUserById({
        id:id
    }).then((user)=>{
        if(user){
          user.password = null;
          req.profile = user;
          next();
        }else{
            return res.status(400).json({error:"user not found"});
        }
    });
  }else{
    return res.status(400).json({error:"could not establish connection to database"});
  }
};