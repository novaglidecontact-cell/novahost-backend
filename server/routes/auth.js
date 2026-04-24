const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: 'Utilisateur ou email déjà utilisé.' });

        const user = new User({ username, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, username, email, plan: user.plan, createdAt: user.createdAt } });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Erreur: ' + err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Identifiants invalides.' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Identifiants invalides.' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, email, plan: user.plan, createdAt: user.createdAt } });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Erreur: ' + err.message });
    }
});

module.exports = router;
