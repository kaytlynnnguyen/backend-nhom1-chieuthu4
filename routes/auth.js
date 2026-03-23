const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const User = require('../models/User');

// 1. ROUTE ĐĂNG KÝ
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Email này đã tồn tại!' });

        const salt = await bcrypt.getSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ firstName, lastName, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ msg: 'Đăng ký thành công!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi máy chủ');
    }
}); // Kết thúc route register

// 2. ROUTE ĐĂNG NHẬP
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra user tồn tại
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Thông tin đăng nhập không chính xác' });

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Thông tin đăng nhập không chính xác' });

        // Tạo chuỗi mã hóa JWT
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: { id: user._id, firstName: user.firstName, email: user.email }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi máy chủ');
    }
}); // Kết thúc route login

module.exports = router;