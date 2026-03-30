const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Helper function to read flower data
function readFlowerData() {
  const flowerDataPath = path.join(__dirname, '..', 'data', 'node.flowers.json');
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

// POST /cart/add - Thêm sản phẩm vào giỏ hàng
router.post('/add', auth, async (req, res) => {
  try {
    const { flowerId, quantity = 1 } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Lấy thông tin hoa từ file JSON
    const flowers = readFlowerData();
    const flower = flowers.find(f => f.id === Number(flowerId));

    if (!flower) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Tìm giỏ hàng của user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Tạo giỏ hàng mới nếu chưa có
      cart = new Cart({
        userId,
        items: [{
          flowerId: flower.id,
          name: flower.name,
          image: flower.image,
          price: flower.price,
          quantity: quantity
        }]
      });
    } else {
      // Kiểm tra xem sản phẩm đã có trong giỏ chưa
      const existingItem = cart.items.find(item => item.flowerId === flower.id);

      if (existingItem) {
        // Tăng số lượng nếu đã có
        existingItem.quantity += quantity;
      } else {
        // Thêm sản phẩm mới
        cart.items.push({
          flowerId: flower.id,
          name: flower.name,
          image: flower.image,
          price: flower.price,
          quantity: quantity
        });
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
    const userId = new mongoose.Types.ObjectId(req.user.id);
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
    const userId = new mongoose.Types.ObjectId(req.user.id);
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
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const flowerId = Number(req.params.id);
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    const item = cart.items.find(item => item.flowerId === flowerId);

    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }

    item.quantity = quantity;
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