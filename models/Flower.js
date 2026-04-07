const mongoose = require('mongoose');

const flowerSchema = new mongoose.Schema({
    id: Number,
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, default: 'bohoa' },
    description: String,
    meaning: String,
}, { timestamps: true });

module.exports = mongoose.model('Flower', flowerSchema);