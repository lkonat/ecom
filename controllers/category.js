const Category = require("../models/category");
exports.create = async(req,res)=>{
    const category_name = req.body.name;
    let connection = await Category.open();
    if(!connection.err){
        Category.addCategory({
          name:category_name
      }).then((category)=>{
          if(category && category.category_id){
            return res.json(category);
          }else{
              return res.status(400).json({error:category && category.err?category.err:"could not add category"});
          }
      });
    }else{
      return res.status(400).json({error:"could not establish connection to database"});
    }
};

exports.categoryById = async(req,res,next,id)=>{
  let connection = await Category.open();
  if(!connection.err){
      Category.findById({
        category_id:id
    }).then((category)=>{
        if(category && category.category_id){
          req.category = category;
          next();
        }else{
            return res.status(400).json({error:category && category.err?category.err:"could not get category"});
        }
    });
  }else{
    return res.status(400).json({error:"could not establish connection to database"});
  }
};
exports.read = async(req,res)=>{
  res.json(req.category);
};
exports.update = async(req,res)=>{
  let category_name = req.body.name;
  let connection = await Category.open();
  let category = req.category;
  if(!connection.err){
      Category.updateCategory({
        category_id:category.category_id,
        name:category_name
    }).then((updated)=>{
        if(updated && updated.ok){
            return res.json(updated.ok);
        }else{
            return res.status(400).json({error:updated && updated.err?updated.err:"could not update category"});
        }
    });
  }else{
    return res.status(400).json({error:"could not establish connection to database"});
  }
};

exports.remove = async(req,res)=>{
  let connection = await Category.open();
  let category = req.category;
  if(!connection.err){
      Category.removeCategory({
        category_id:category.category_id
    }).then((outcome)=>{
        if(outcome && outcome.ok){
            return res.json(outcome.ok);
        }else{
            return res.status(400).json({error:outcome && outcome.err?outcome.err:"could not remove category"});
        }
    });
  }else{
    return res.status(400).json({error:"could not establish connection to database"});
  }
};

exports.list = async(req,res)=>{
  let connection = await Category.open();
  if(!connection.err){
      Category.getAll().then((outcome)=>{
        if(outcome && outcome.ok){
            return res.json(outcome.ok);
        }else{
            return res.status(400).json({error:outcome && outcome.err?outcome.err:"could not get all category"});
        }
    });
  }else{
    return res.status(400).json({error:"could not establish connection to database"});
  }
};
