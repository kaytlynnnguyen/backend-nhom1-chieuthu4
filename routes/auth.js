const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu
const User = require('../models/User');

// ĐỊA CHỈ: POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        // 1. Nhận dữ liệu từ Frontend gửi lên
        const { firstName, lastName, email, password } = req.body;

        // 2. Kiểm tra xem email này đã có ai đăng ký chưa
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Email này đã tồn tại!' });
        }

        // 3. MÃ HÓA MẬT KHẨU (Hash)
        // Tạo một "chuỗi muối" ngẫu nhiên
        const salt = await bcrypt.genSalt(10);
        // Trộn mật khẩu thật với muối để ra chuỗi loằng ngoằng $2b$10...
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Tạo một người dùng mới từ cái "khuôn" User
        user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword // Lưu mật khẩu đã mã hóa, không lưu mật khẩu thật
        });

        // 5. Lưu xuống Database
        await user.save();

        res.status(201).json({ msg: 'Đăng ký thành công!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi máy chủ');
    }
});

module.exports = router;