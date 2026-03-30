// <<<<<<< HEAD
// ﻿const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// =======
// require('dotenv').config();
// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose"); 
// const authRoutes = require("./routes/auth"); 
// const User = require('./models/User'); 
// >>>>>>> feature/user-auth

// const app = express();
// app.use(cors());
// app.use(express.json());

// <<<<<<< HEAD
// // dữ liệu giả lập thay cho database
// const users = [
//   { id: 1, name: 'Han' },
//   { id: 2, name: 'Minh' },
//   { id: 3, name: 'Duc' },
//   { id: 4, name: 'Lan' },
//   { id: 5, name: 'Ngan' }
// ];

// app.get('/', (req, res) => {
//   res.redirect('/users');
// });

// app.get('/users', (req, res) => {
//   res.json(users);
// });

// app.get('/users/:id', (req, res) => {
//   const id = parseInt(req.params.id);
//   const user = users.find(u => u.id === id);
//   if (!user) return res.status(404).json({ message: 'User not found' });
//   res.json(user);
// });

// const flowerDataPath = path.join(__dirname, 'data', 'node.flowers.json');
// =======
// // ✅ Lấy URI từ .env thay vì hard-code
// const MONGO_URI = process.env.MONGO_URI;

// // Kiểm tra nếu chưa có .env
// if (!MONGO_URI) {
//   console.error("❌ Chưa có MONGO_URI trong file .env");
//   process.exit(1);
// }

// // Kết nối MongoDB
// mongoose.connect(MONGO_URI)
//   .then(() => console.log("✅ Kết nối MongoDB thành công!"))
//   .catch(err => {
//     console.error("❌ Lỗi kết nối MongoDB:", err.message);
//     process.exit(1);
//   });

// // -----------------------------------------

// app.use("/api/auth", authRoutes);

// app.get("/", (req, res) => {
//   res.send("🚀 API Web Bán Hoa đang chạy!");
// });

// // Lấy tất cả users
// app.get("/users", async (req, res) => {
//   try {
//     const allUsers = await User.find();
//     res.json(allUsers);
//   } catch (err) {
//     res.status(500).json({ 
//       message: "Lỗi khi lấy danh sách user", 
//       error: err.message 
//     });
//   }
// });

// // Lấy user theo ID
// app.get("/users/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ 
//         message: "Không tìm thấy User trong Database" 
//       });
//     }

//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ 
//       message: "ID không hợp lệ hoặc lỗi server", 
//       error: err.message 
//     });
//   }
// });

// // PORT từ .env
// const PORT = process.env.PORT || 5000;
// >>>>>>> feature/user-auth

// // serve image files from flower_pics folder
// app.use('/flower_pics', express.static(path.join(__dirname, 'flower_pics')));

// function readFlowerData() {
//   const rawData = fs.readFileSync(flowerDataPath, 'utf8');
//   const parsed = JSON.parse(rawData);
//   return parsed.map((flower, idx) => ({
//     id: flower.id || idx + 1,
//     name: flower.name || 'Không rõ',
//     image: flower.image || '',
//     price: Number(flower.price) || 0,
//     category: flower.category || 'unknown',
//     description: flower.description || '',
//     meaning: flower.meaning || '',
//     raw: flower
//   }));
// }

// app.get('/flowers', (req, res) => {
//   try {
//     let flowers = readFlowerData();
//     const { type, minPrice, maxPrice } = req.query;

//     if (type) {
//       flowers = flowers.filter(f => f.category.toLowerCase() === type.toLowerCase());
//     }

//     if (minPrice) {
//       const min = Number(minPrice);
//       if (!Number.isNaN(min)) flowers = flowers.filter(f => f.price >= min);
//     }

//     if (maxPrice) {
//       const max = Number(maxPrice);
//       if (!Number.isNaN(max)) flowers = flowers.filter(f => f.price <= max);
//     }

//     res.json(flowers);
//   } catch (error) {
//     console.error('Error reading flowers:', error);
//     res.status(500).json({ message: 'Không thể đọc file dữ liệu' });
//   }
// });

// app.get('/flowers/:id', (req, res) => {
//   try {
//     const flowers = readFlowerData();
//     const id = Number(req.params.id);
//     const flower = flowers.find(f => f.id === id);
//     if (!flower) return res.status(404).json({ message: 'Flower not found' });
//     res.json(flower);
//   } catch (error) {
//     console.error('Error reading flower detail:', error);
//     res.status(500).json({ message: 'Không thể đọc file dữ liệu' });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
// <<<<<<< HEAD
//   console.log(`Backend đang chạy tại http://localhost:${PORT}`);
// });
// =======
//   console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
// });
// >>>>>>> feature/user-auth
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); 
const fs = require('fs');
const path = require('path');

const authRoutes = require("./routes/auth"); 
const User = require('./models/User'); 

const app = express();
//app.use(cors());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://frontend-nhom1-chieuthu4-1.onrender.com"
  ],
  credentials: true
}));

// 👇 THÊM Ở ĐÂY
console.log("CORS ACTIVE");

app.options('*', cors());

app.use(express.json());

// ================== MONGODB ==================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Chưa có MONGO_URI trong file .env");
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
    image: flower.image || '',
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