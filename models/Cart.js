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

// Tính tổng tiền khi lưu
CartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

module.exports = mongoose.model('Cart', CartSchema);