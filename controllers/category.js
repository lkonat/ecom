const Category = require("../models/category");
exports.create = async(req,res)=>{
    const category_name = req.body.name;
    let connection = await Category.open();
    if(!connection.err){
        Category.addCategory({
          name:category_name
      }).then((category)=>{
        console.log("craete",category);
          if(category && category.category_id){
            return res.json(category);
          }else{
              return res.status(400).json({error:category.err?category.err:"could not add category"});
          }
      });
    }else{
      return res.status(400).json({error:"could not establish connection to database"});
    }
};