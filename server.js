require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); 
const fs = require('fs');
const path = require('path');

const authRoutes = require("./routes/auth"); 
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const User = require('./models/User'); 
const Flower = require('./models/Flower');


const app = express();
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    const allowedOrigins = [
      'https://frontend-nhom1-chieuthu4-1.onrender.com'
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy does not allow this origin'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes); 

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

// 1. Thêm sản phẩm
app.post('/flowers', async (req, res) => {
    try {
        const newFlower = new Flower(req.body);
        const savedFlower = await newFlower.save();

        const rawData = fs.readFileSync(flowerDataPath, 'utf8');
        const currentFlowers = JSON.parse(rawData);

        const flowerToAdd = { 
            _id: { $oid: savedFlower._id.toString() }, 
            ...req.body 
        };
        currentFlowers.push(flowerToAdd);

        fs.writeFileSync(flowerDataPath, JSON.stringify(currentFlowers, null, 2));

        res.status(201).json(savedFlower);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 2. Cập nhật sản phẩm
app.put('/flowers/:id', async (req, res) => {
    try {
        const { id } = req.params;

        try { await Flower.findByIdAndUpdate(id, req.body); } catch(e) {}

        const rawData = fs.readFileSync(flowerDataPath, 'utf8');
        let currentFlowers = JSON.parse(rawData);

        // Tìm hoa cần sửa
        const index = currentFlowers.findIndex(f => 
            (f._id && f._id.$oid === id) || 
            (f._id && f._id.toString() === id) || 
            f.id == id
        );

        if (index !== -1) {
            currentFlowers[index] = { ...currentFlowers[index], ...req.body };
            fs.writeFileSync(flowerDataPath, JSON.stringify(currentFlowers, null, 2));
            res.json(currentFlowers[index]);
        } else {
            res.status(404).json({ message: "Không tìm thấy hoa trong JSON" });
        }
    } catch (err) {
        res.status(400).json({ message: "Lỗi khi cập nhật" });
    }
});
// 3. Xóa sản phẩm
app.delete('/flowers/:id', async (req, res) => {
    try {
        const { id } = req.params;

        try { await Flower.findByIdAndDelete(id); } catch(e) {}

        const rawData = fs.readFileSync(flowerDataPath, 'utf8');
        let currentFlowers = JSON.parse(rawData);

        const filteredFlowers = currentFlowers.filter(f => {

            const fId = f._id?.$oid || f._id || f.id;
            
            return String(fId) !== String(id); 
        });

        fs.writeFileSync(flowerDataPath, JSON.stringify(filteredFlowers, null, 2));
        res.json({ message: "Đã xóa thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi xóa" });
    }
});
// ================== SERVER ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});

