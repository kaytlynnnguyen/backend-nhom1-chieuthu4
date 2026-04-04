const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

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

router.post('/', auth, async (req, res) => {
  try {
    const paymentMethod = String(req.body.paymentMethod || '').trim().toLowerCase();
    const buyerName = String(req.body.name || '').trim();
    const phone = String(req.body.phone || '').trim();
    const address = String(req.body.address || '').trim();

    if (!buyerName || !phone || !address) {
      return res.status(400).json({ message: 'Vui lòng điền tên, số điện thoại và địa chỉ' });
    }

    if (!paymentMethod || !['cash', 'bank'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
    }

    const userId = resolveUserId(req, res);
    if (!userId) return;

    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: 'Giỏ hàng trống, không thể đặt đơn' });
    }

    const order = new Order({
      userId,
      items: cart.items,
      totalAmount: cart.totalAmount,
      paymentMethod,
      buyerName,
      phone,
      address,
      status: paymentMethod === 'cash' ? 'paid' : 'pending'
    });

    await order.save();
    await Cart.deleteOne({ userId });

    res.json({
      message: 'Đặt đơn thành công',
      orderId: order._id,
      order: {
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        items: order.items
      }
    });
  } catch (error) {
    console.error('Lỗi khi đặt đơn:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
