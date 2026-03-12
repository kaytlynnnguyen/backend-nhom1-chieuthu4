// const express = require("express");
// const cors = require("cors");
// // const mysql = require("mysql2");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // const db = mysql.createConnection({
// //   host: "localhost",
// //   user: "root",
// //   password: "",
// //   database: "pmweb_data"
// // });

// // db.connect((err)=>{
// //   if(err){
// //     console.log(err);
// //   }else{
// //     console.log("Database connected");
// //   }
// // });
// const users = [
//   { id: 1, name: "Han"},
//   { id: 2, name: "Duc" },
//   { id: 3, name: "Lan" },
//   { id: 4, name: "Ngan" },
//   { id: 5, name: "Minh" }
// ];
// app.get("/", (req, res) => {
//   res.redirect("/users");
// });
// app.get("/users", (req,res)=>{
//     db.query("SELECT * FROM users",(err,result)=>{
//         if(err){
//             res.send(err);
//         }else{
//             res.json(result);
//         }
//     });
// });

// app.get("/users/:id",(req,res)=>{
//     const id = req.params.id;

//     db.query("SELECT * FROM users WHERE id=?",[id],(err,result)=>{
//         if(err){
//             res.send(err);
//         }else{
//             res.json(result);
//         }
//     });
// });

// app.listen(5000, ()=>{
//   console.log("Server running on port 5000");
// });
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// dữ liệu giả lập thay cho database
const users = [
  { id: 1, name: "Han" },
  { id: 2, name: "Minh" },
  { id: 3, name: "Duc" },
  { id: 4, name: "Lan" },
  { id: 5, name: "Ngan" }
];

// khi mở link gốc -> chuyển sang /users
app.get("/", (req, res) => {
  res.redirect("/users");
});

// lấy tất cả users
app.get("/users", (req, res) => {
  res.json(users);
});

// lấy user theo id
app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

// port cho Render
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});