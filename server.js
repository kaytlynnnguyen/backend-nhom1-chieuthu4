const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); 
const authRoutes = require("./routes/auth"); 
const User = require('./models/User'); 

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/web_ban_hoa')
  .then(() => console.log("✅ Đã kết nối Database Web Bán Hoa thành công!"))
  .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));
// -----------------------------------------

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.redirect("/users");
});

// 2. Lấy tất cả users từ MongoDB
app.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find();
    res.json(allUsers);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách user", error: err.message });
  }
});

// 3. Lấy user theo ID từ MongoDB
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy User này trong Database" });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "ID không hợp lệ hoặc lỗi server", error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});