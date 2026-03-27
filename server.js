const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// dữ liệu giả lập thay cho database
const users = [
  { id: 1, name: 'Han' },
  { id: 2, name: 'Minh' },
  { id: 3, name: 'Duc' },
  { id: 4, name: 'Lan' },
  { id: 5, name: 'Ngan' }
];

app.get('/', (req, res) => {
  res.redirect('/users');
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.get('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

const flowerDataPath = path.join(__dirname, 'data', 'node.flowers.json');

// serve image files from flower_pics folder
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend đang chạy tại http://localhost:${PORT}`);
});
