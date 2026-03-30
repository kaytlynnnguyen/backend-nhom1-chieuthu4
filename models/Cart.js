const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  flowerId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  }
});

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [CartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Tính tổng tiền khi lưu (Mongoose 9: không dùng next() trong pre sync)
CartSchema.pre('save', function() {
  this.totalAmount = this.items.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return total + price * qty;
  }, 0);
});

module.exports = mongoose.model('Cart', CartSchema);