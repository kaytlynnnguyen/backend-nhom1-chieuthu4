const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pmweb_data"
});

db.connect((err)=>{
  if(err){
    console.log(err);
  }else{
    console.log("Database connected");
  }
});
app.get("/", (req, res) => {
  res.redirect("/users");
});
app.get("/users", (req,res)=>{
    db.query("SELECT * FROM users",(err,result)=>{
        if(err){
            res.send(err);
        }else{
            res.json(result);
        }
    });
});

app.get("/users/:id",(req,res)=>{
    const id = req.params.id;

    db.query("SELECT * FROM users WHERE id=?",[id],(err,result)=>{
        if(err){
            res.send(err);
        }else{
            res.json(result);
        }
    });
});

app.listen(5000, ()=>{
  console.log("Server running on port 5000");
});