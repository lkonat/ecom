const User = require("../models/user");
// User.open().then((res_x)=>{
//     console.log(res_x,"Database");
//     if(res_x.created || res_x.opened){
  
//     }else {
//       Database.close();
//     }
//   });
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
    res.json({message:"helllo"});
};