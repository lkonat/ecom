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
        );`
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
  addUser(args){
    return new Promise((resolve, reject) => {
        if(!args.name){
            return resolve({ err: "name is missing"});
        }
        if(!args.email){
            return resolve({ err: "email is missing"});
        }
        if(!args.hash){
            return resolve({ err: "hash is missing"});
        }
        let id = this.makeid();
        let ts = new Date().getTime();
        this.db.run(`INSERT INTO users(id,email,name,password,ts) VALUES(?,?,?,?,?)`,[id,args.email,args.name,args.hash,ts], function(err, row) {
            if (!row){
                return resolve(null);
            }
            return resolve({id:id});
          });
    });  
  }
  getUser(args){
    return new Promise((resolve, reject) => {
        this.db.get('SELECT name,email,id FROM users WHERE username = ? AND password = ?', args.email, args.password, function(err, row) {
            if (!row){
                return resolve(null);
            }
            return resolve(row);
          });
    });
  }
  chechEmail(args){
    return new Promise((resolve, reject) => {
        this.db.get('SELECT * FROM users WHERE email = ?', args.email, function(err, row) {
            if (!row){
                return resolve(null);
            }
            if(row.id){
                return resolve(row);
            }else{
                return resolve(null);
            }
          });
    });
  }
  getUserById(args){
    return new Promise((resolve, reject) => {
        this.db.get('SELECT * FROM users WHERE id = ?', args.id, function(err, row) {
            if (!row){
                return resolve(null);
            }
            if(row.id){
                return resolve(row);
            }else{
                return resolve(null);
            }
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