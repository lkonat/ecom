const fs = require("fs");
const formidable = require("formidable");
const _ = require("lodash");
const Product = require("../models/product");
function makeid() {
    let text = "";
    let possible ="123456789";
    for (var i = 0; i < 12; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return parseInt(text);
}
exports.create = async(req,res)=>{
   let form = new formidable.IncomingForm();
   form.keepExtensions = true;
   form.parse(req,async(err, fields, files)=>{
       if(!fields.name || !fields.description || !fields.price || !fields.quantity){
          return res.status(400).json({err:"all fiedls are required"});
       }
      if(err){
          return res.status(400).json({err:"image could not be uploaded"});
      }
      let photos = false;
      if(files.photo){
          if(files.photo.size>1000000){
              return res.status(400).json({err:"file is too large"});
          }
         photos = [];
         let file_name = `upload_${makeid()}_${files.photo.name}`;
         let new_path = process.env.IMG_UPLOAD_DIR+"/"+file_name;
         fs.renameSync(files.photo.path, new_path);
         photos.push({url:file_name, type:files.photo.type});
      }
      let connection = await Product.open();
      if(!connection.err){
        Product.addProduct({
           name:fields.name,
           description:fields.description,
           price:fields.price,
           quantity:fields.quantity,
           photos:photos
        }).then((new_product)=>{
            if(new_product && new_product.product_id){
                return res.json(new_product);
            }else{
                return res.status(400).json({error:new_product.err?new_product.err:"could not add new product"});
            }
        });
      }else{
        return res.status(400).json({error:"could not establish connection to database"});
      }
   });
};

exports.productById = async(req,res,next,id)=>{
    let connection = await Product.open();
    if(!connection.err){
      Product.findById({
         product_id:id
      }).then((product)=>{
          if(product && !product.err){
              req.product = product;
              next();
          }else{
              return res.status(400).json({error:product && product.err?product.err:"could not get product"});
          }
      });
    }else{
      return res.status(400).json({error:"could not establish connection to database"});
    }
};

exports.read = (req,res)=>{
    res.json(req.product);
};

exports.remove = async(req,res)=>{
    let product = req.product;
    let connection = await Product.open();
    if(!connection.err){
      Product.remove({
         product_id:product.product_id
      }).then((success)=>{
          if(success && !success.err){
              return res.json({success:true});
          }else{
              return res.status(400).json({error:success && success.err?success.err:"could remove product"});
          }
      });
    }else{
      return res.status(400).json({error:"could not establish connection to database"});
    }
};
exports.update = async(req,res)=>{
    console.log("update");
    let product = req.product;
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req,async(err, fields, files)=>{
        if(!fields.name || !fields.description || !fields.price || !fields.quantity){
           return res.status(400).json({err:"all fiedls are required"});
        }
       if(err){
           return res.status(400).json({err:"image could not be uploaded"});
       }
       let photos = false;
       if(files.photo){
           if(files.photo.size>1000000){
               return res.status(400).json({err:"file is too large"});
           }
          photos = [];
          let file_name = `upload_${makeid()}_${files.photo.name}`;
          let new_path = process.env.IMG_UPLOAD_DIR+"/"+file_name;
          fs.renameSync(files.photo.path, new_path);
          photos.push({url:file_name, type:files.photo.type});
       }
       let connection = await Product.open();
       if(!connection.err){
         Product.updateProduct({
            product_id:product.product_id,
            name:fields.name,
            description:fields.description,
            price:fields.price,
            quantity:fields.quantity,
            photos:photos
         }).then((success)=>{
             if(success && success.ok){
                 return res.json(success.ok);
             }else{
                 return res.status(400).json({error:success && success.err?success.err:"could not update product"});
             }
         });
       }else{
         return res.status(400).json({error:"could not establish connection to database"});
       }
    });
}