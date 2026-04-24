const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkPlan = require('../middleware/checkPlan');
const Bot = require('../models/Bot');

// Get all files for a bot
router.get('/:botId', [auth, checkPlan], async (req, res) => {
    try {
        const bot = await Bot.findOne({ _id: req.params.botId, owner: req.user.id });
        if (!bot) return res.status(404).json({ message: 'Bot non trouvé.' });
        
        // Initialize files if they don't exist (for older bots)
        if (!bot.files || bot.files.length === 0) {
            bot.files = [{ name: 'index.js', content: '// Bienvenue sur votre bot Discord !\nconsole.log("Bot en ligne !");' }];
            await bot.save();
        }
        
        res.json(bot.files);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Create or update a file
router.post('/:botId', [auth, checkPlan], async (req, res) => {
    try {
        const { name, content } = req.body;
        const bot = await Bot.findOne({ _id: req.params.botId, owner: req.user.id });
        if (!bot) return res.status(404).json({ message: 'Bot non trouvé.' });

        const fileIndex = bot.files.findIndex(f => f.name === name);
        if (fileIndex > -1) {
            bot.files[fileIndex].content = content;
        } else {
            bot.files.push({ name, content });
        }

        await bot.save();
        res.json({ message: 'Fichier sauvegardé avec succès !', files: bot.files });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Delete a file
router.delete('/:botId/:fileName', [auth, checkPlan], async (req, res) => {
    try {
        const bot = await Bot.findOne({ _id: req.params.botId, owner: req.user.id });
        if (!bot) return res.status(404).json({ message: 'Bot non trouvé.' });

        if (req.params.fileName === 'index.js') {
            return res.status(400).json({ message: 'Impossible de supprimer le fichier principal index.js' });
        }

        bot.files = bot.files.filter(f => f.name !== req.params.fileName);
        await bot.save();
        res.json({ message: 'Fichier supprimé.', files: bot.files });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
