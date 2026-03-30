require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); 
const fs = require('fs');
const path = require('path');

const authRoutes = require("./routes/auth"); 
const cartRoutes = require("./routes/cart");
const User = require('./models/User'); 

const app = express();
//app.use(cors());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://frontend-nhom1-chieuthu4-1.onrender.com"
  ],
  credentials: true
}));


app.use(express.json());

// ================== MONGODB ==================
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI) {
  console.error("❌ Chưa có MONGO_URI trong file .env");
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error("❌ Chưa có JWT_SECRET trong file .env");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Kết nối MongoDB thành công!"))
  .catch(err => {
    console.error("❌ Lỗi kết nối MongoDB:", err.message);
    process.exit(1);
  });

// ================== ROUTES ==================
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);

app.get("/", (req, res) => {
  res.send("🚀 API Web Bán Hoa đang chạy!");
});

// ================== USER (MongoDB) ==================
app.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find();
    res.json(allUsers);
  } catch (err) {
    res.status(500).json({ 
      message: "Lỗi khi lấy danh sách user", 
      error: err.message 
    });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        message: "Không tìm thấy User trong Database" 
      });
    }

    res.json(user);
  } catch (err) {
    res.status(400).json({ 
      message: "ID không hợp lệ hoặc lỗi server", 
      error: err.message 
    });
  }
});

// ================== FLOWER (JSON FILE) ==================
const flowerDataPath = path.join(__dirname, 'data', 'node.flowers.json');

// serve image
app.use('/flower_pics', express.static(path.join(__dirname, 'flower_pics')));

function readFlowerData() {
  const rawData = fs.readFileSync(flowerDataPath, 'utf8');
  const parsed = JSON.parse(rawData);
  return parsed.map((flower, idx) => ({
    id: flower.id || idx + 1,
    name: flower.name || 'Không rõ',
    image: (flower.image && String(flower.image).trim()) || '/flower_pics/1.jpg',
    price: Number(flower.price) || 0,
    category: flower.category || 'unknown',
    description: flower.description || '',
    meaning: flower.meaning || '',
    raw: flower
  }));
}

app.get('/flowers', (req, res) => {
  try {
    let flowers = readFlowerData();
    const { type, minPrice, maxPrice } = req.query;

    if (type) {
      flowers = flowers.filter(f => f.category.toLowerCase() === type.toLowerCase());
    }

    if (minPrice) {
      const min = Number(minPrice);
      if (!Number.isNaN(min)) flowers = flowers.filter(f => f.price >= min);
    }

    if (maxPrice) {
      const max = Number(maxPrice);
      if (!Number.isNaN(max)) flowers = flowers.filter(f => f.price <= max);
    }

    res.json(flowers);
  } catch (error) {
    console.error('Error reading flowers:', error);
    res.status(500).json({ message: 'Không thể đọc file dữ liệu' });
  }
});

app.get('/flowers/:id', (req, res) => {
  try {
    const flowers = readFlowerData();
    const id = Number(req.params.id);
    const flower = flowers.find(f => f.id === id);
    if (!flower) return res.status(404).json({ message: 'Flower not found' });
    res.json(flower);
  } catch (error) {
    console.error('Error reading flower detail:', error);
    res.status(500).json({ message: 'Không thể đọc file dữ liệu' });
  }
});

// ================== SERVER ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});