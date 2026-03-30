const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function resolveUserId(req, res) {
  if (!req.user || !req.user.id) {
    res.status(401).json({ message: 'Token không có userId' });
    return null;
  }
  try {
    return new mongoose.Types.ObjectId(req.user.id);
  } catch (err) {
    res.status(401).json({ message: 'Token không hợp lệ (userId)' });
    return null;
  }
}

// GET /cart/add: lỗi phương thức rõ (để thấy không gọi GET)
router.get('/add', (req, res) => {
  res.status(405).json({ message: 'Phải gọi POST /api/cart/add' });
});

// Helper function to read flower data
function readFlowerData() {
  const flowerDataPath = path.join(__dirname, '..', 'data', 'node.flowers.json');
  const rawData = fs.readFileSync(flowerDataPath, 'utf8');
  const parsed = JSON.parse(rawData);
  return parsed.map((flower, idx) => ({
    id: flower.id || idx + 1,
    name: flower.name || 'Không rõ',
    // Cart schema bắt buộc image !== ''; chuỗi rỗng gây ValidationError 500
    image: (flower.image && String(flower.image).trim()) || '/flower_pics/1.jpg',
    price: Number(flower.price) || 0,
    category: flower.category || 'unknown',
    description: flower.description || '',
    meaning: flower.meaning || '',
    raw: flower
  }));
}

function normalizeQuantity(q) {
  const n = Number(q);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function cartItemPayload(flower, quantity) {
  return {
    flowerId: flower.id,
    name: flower.name,
    image: flower.image,
    price: flower.price,
    quantity: normalizeQuantity(quantity)
  };
}

// POST /cart/add - Thêm sản phẩm vào giỏ hàng
router.post('/add', auth, async (req, res) => {
  try {
    const { flowerId, quantity: rawQty } = req.body;
    const fid = Number(flowerId);
    if (flowerId === undefined || flowerId === null || flowerId === '' || !Number.isFinite(fid)) {
      return res.status(400).json({ message: 'Thiếu hoặc flowerId không hợp lệ' });
    }
    const addQty = normalizeQuantity(rawQty);

    const userId = resolveUserId(req, res);
    if (!userId) return;

    // Lấy thông tin hoa từ file JSON
    const flowers = readFlowerData();
    const flower = flowers.find(f => f.id === fid);

    if (!flower) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Tìm giỏ hàng của user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Tạo giỏ hàng mới nếu chưa có
      cart = new Cart({
        userId,
        items: [cartItemPayload(flower, addQty)]
      });
    } else {
      // Kiểm tra xem sản phẩm đã có trong giỏ chưa
      const existingItem = cart.items.find(item => item.flowerId === flower.id);

      if (existingItem) {
        // Tăng số lượng nếu đã có (số nguyên, tránh nối chuỗi)
        existingItem.quantity = normalizeQuantity(existingItem.quantity) + addQty;
      } else {
        // Thêm sản phẩm mới
        cart.items.push(cartItemPayload(flower, addQty));
      }
    }

    await cart.save();
    res.json({
      message: 'Đã thêm vào giỏ hàng',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        itemCount: cart.items.length
      }
    });

  } catch (error) {
    console.error('Lỗi thêm vào giỏ hàng:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET /cart - Lấy giỏ hàng của user
router.get('/', auth, async (req, res) => {
  try {
    const userId = resolveUserId(req, res);
    if (!userId) return;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.json({
        items: [],
        totalAmount: 0,
        itemCount: 0
      });
    }

    res.json({
      items: cart.items,
      totalAmount: cart.totalAmount,
      itemCount: cart.items.length
    });

  } catch (error) {
    console.error('Lỗi lấy giỏ hàng:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// DELETE /cart/:id - Xóa sản phẩm khỏi giỏ hàng
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = resolveUserId(req, res);
    if (!userId) return;
    const flowerId = Number(req.params.id);

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    // Tìm và xóa item
    const itemIndex = cart.items.findIndex(item => item.flowerId === flowerId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.json({
      message: 'Đã xóa sản phẩm khỏi giỏ hàng',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        itemCount: cart.items.length
      }
    });

  } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// PUT /cart/:id - Cập nhật số lượng sản phẩm
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = resolveUserId(req, res);
    if (!userId) return;
    const flowerId = Number(req.params.id);
    const qty = normalizeQuantity(req.body.quantity);
    if (!Number.isFinite(flowerId)) {
      return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    const item = cart.items.find(item => item.flowerId === flowerId);

    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }

    item.quantity = qty;
    await cart.save();

    res.json({
      message: 'Đã cập nhật số lượng',
      cart: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        itemCount: cart.items.length
      }
    });

  } catch (error) {
    console.error('Lỗi cập nhật số lượng:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;