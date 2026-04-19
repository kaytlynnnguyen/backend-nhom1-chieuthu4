const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');


router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 }); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách tài khoản' });
    }
});


router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, password, isActive } = req.body;
        
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'Email này đã tồn tại!' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ firstName, lastName, email, password: hashedPassword, isActive });
        await user.save();
        
        res.status(201).json({ message: 'Tạo tài khoản thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { firstName, lastName, email, isActive } = req.body;
        const updatedData = { firstName, lastName, email, isActive };

        const user = await User.findByIdAndUpdate(req.params.id, updatedData, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        
        res.json({ message: 'Cập nhật thành công', user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật tài khoản' });
    }
});


router.patch('/:id/status', async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        res.json({ message: 'Cập nhật trạng thái thành công', user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa tài khoản thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa tài khoản' });
    }
});

module.exports = router;