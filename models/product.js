const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require('path');
class MainDatabaseControler {
  constructor(args) {
    this.db_name = process.env.DBNAME || "main-db.db";
    this.dir = args.dir;
    this.path = path.join(this.dir ,this.db_name);
    this.create_table_querries = {
        simple_notes: `CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY,
              email TEXT NOT NULL,
              name TEXT NOT NULL,
              password TEXT NOT NULL,
              ts Integer NOT NULL,
              role Integer NOT NULL
          );`,
          category: `CREATE TABLE IF NOT EXISTS category (
              category_id INTEGER NOT NULL,
              name text NOT NULL,
              ts Integer NOT NULL
          );`,
          product: `CREATE TABLE IF NOT EXISTS product (
              product_id INTEGER PRIMARY KEY,
              name TEXT NOT NULL,
              description NOT NULL,
              price REAL NOT NULL,
              quantity Integer NOT NULL,
              ts Integer NOT NULL
          );`,
          product_photo:`CREATE TABLE IF NOT EXISTS product_photo(
            photo_id INTEGER PRIMARY KEY,
            name TEXT,
            url TEXT NOT NULL,
            type TEXT NOT NULL,
            ts Integer NOT NULL,
            product_id INTEGER NOT NULL,
            FOREIGN KEY (product_id) REFERENCES product (product_id)
          );`,
          product_in_category:`CREATE TABLE IF NOT EXISTS product_in_category (
              product_id INTEGER NOT NULL,
              category_id INTEGER NOT NULL,
              ts Integer NOT NULL,
              PRIMARY KEY (category_id,product_id),
              FOREIGN KEY (product_id) REFERENCES product (product_id),
              FOREIGN KEY (category_id) REFERENCES category (category_id)
          );`,
      };
    this.c_events = {}
  }
  makeid() {
    let text = "";
    let possible ="123456789";
    for (var i = 0; i < 12; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return parseInt(text);
  }
  on(what,that){
    this.c_events[what] = that;
  }
  fire_(what,that){
    if(this.c_events[what]){
      this.c_events[what](that);
    }
  }
  addProduct(args){
    return new Promise((resolve, reject) => {
        if(!args.name){
           return resolve({err:"mo name given"});
        }
        if(!args.description){
            return resolve({err:"mo name given"});
         }
         if(!args.price){
            return resolve({err:"mo name given"});
         }
         if(!args.quantity){
            return resolve({err:"mo name given"});
         }

        let product_id = this.makeid();
        let ts = new Date().getTime();
        let transactions = [];
        transactions.push({query:`INSERT INTO product(product_id,name,description,price,quantity,ts) VALUES(?,?,?,?,?,?)`,data:[product_id,args.name,args.description,args.price,args.quantity,ts]});
        transactions.push({query:`INSERT INTO product_photo(product_id,name,description,price,quantity,ts) VALUES(?,?,?,?,?,?)`,data:[product_id,args.name,args.description,args.price,args.quantity,ts]});



        this.db.run(`INSERT INTO product(product_id,name,description,price,quantity,ts) VALUES(?,?,?,?,?,?)`,[product_id,args.name,args.description,args.price,args.quantity,ts], (err, row)=>{
            if (err){
            return resolve({err:err.toString()});
            }
            return resolve({product_id:product_id,name:args.name,ts:ts});
        });
    });
  }

  addCustomTransactions(args) {
    return new Promise((resolve, reject) => {
      let runEachQuery = (db, all_data, idx, callBack)=>{
        if (all_data[idx]) {
          db.run(all_data[idx].query, all_data[idx].data, (err, success) => {
            if (err) {
              return callBack({ err: err.toString() });
            } else {
              runEachQuery(db, all_data, idx + 1, callBack);
            }
          });
        } else {
          return callBack({ ok: true });
        }
      }
      this.db.serialize(() => {
        this.db.run("BEGIN");
         runEachQuery(this.db, args.transactions, 0, outcome => {
          if (outcome.ok) {
            this.db.run("commit");
            return resolve({ ok: true });
          } else {
            this.db.run("rollback");
            return resolve({ err: outcome.err });
          }
        });
      });
    });
  }
  create_table(callBack){
    let transactions = [];
    for(let elt in   this.create_table_querries){
      transactions.push({query:this.create_table_querries[elt]});
    }
    this.addCustomTransactions({
      transactions: transactions
    }).then(outcome => {
      if(outcome.err){
        if(this.path.endsWith(this.db_name)){
          fs.unlink(this.path,(err_f)=>{ //delete database if cannot create table when creating the database
            return callBack({err:outcome.err});
          });
        }else {
          return callBack({err:outcome.err});
        }
      }else {
        return callBack({created:true});
      }
    });
  }
  create(callBack){
    this.db = new sqlite3.Database(this.path, (err)=>{
      if (err) {
        return callBack({err:err});
      } else {
        this.create_table((outcome)=>{
          return callBack(outcome);
        });
      }
    });
  }
  open(){
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.path,sqlite3.OPEN_READWRITE,(err)=>{
        if (err) {
          this.create((sucess)=>{
             return resolve(sucess);
          });
        }else {
         return resolve({opened:true});
        }
      });
    });
  }
  close(){
    if(this.db){
      this.db.close();
    }
  }
}
module.exports = new MainDatabaseControler({dir:process.env.DBPATH});