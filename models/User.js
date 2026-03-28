const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true // Để không ai đăng ký trùng email
    },
    password: { 
        type: String, 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: false // Giống như mẫu dữ liệu của bạn
    }
});

module.exports = mongoose.model('User', UserSchema);