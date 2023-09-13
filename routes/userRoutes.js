const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        req.flash('error_msg', 'Username already exists.');
        return res.redirect('/register');
    }

    try {
        const hashedPassword = await User.encryptPassword(password);
        const user = new User({ username, password: hashedPassword });
        await user.save();

        req.flash('success_msg', 'You are now registered and can log in.');
        res.redirect('/main');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error_msg', 'An error occurred during registration.');
        res.redirect('/register');
    }
});

module.exports = router;
