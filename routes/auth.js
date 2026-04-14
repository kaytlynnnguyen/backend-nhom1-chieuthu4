const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const User = require('../models/User');
const auth = require('../middleware/auth'); // nhớ import


// 1. ROUTE ĐĂNG KÝ
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        // Kiểm tra dữ liệu đầu vào (phòng hờ lỗi undefined từ frontend)
        if (!password) {
            return res.status(400).json({ msg: 'Mật khẩu không được để trống' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Email này đã tồn tại!' });

        // SỬA TẠI ĐÂY: đổi getSalt thành genSalt
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ firstName, lastName, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ msg: 'Đăng ký thành công!' });
    } catch (err) {
        console.error("Lỗi đăng ký:", err.message); // In lỗi chi tiết ra console
        res.status(500).json({ msg: 'Lỗi máy chủ', error: err.message });
    }
});

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
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Lỗi máy chủ', error: err.message });
    }
}); // Kết thúc route login

// 3. ROUTE ĐỔI MẬT KHẨU

router.post('/change-password', auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Kiểm tra input
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ msg: 'Vui lòng nhập đầy đủ mật khẩu' });
        }

        // Lấy user từ token
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'Không tìm thấy user' });
        }

        // So sánh mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Mật khẩu cũ không đúng' });
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật
        user.password = hashedPassword;
        await user.save();

        res.json({ msg: 'Đổi mật khẩu thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Lỗi server', error: err.message });
    }
});

module.exports = router;