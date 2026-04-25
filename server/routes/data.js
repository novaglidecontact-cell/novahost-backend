const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Data = require('../models/Data');
const Bot = require('../models/Bot');

// Get all data for a specific bot
router.get('/:botId', auth, async (req, res) => {
    try {
        const bot = await Bot.findOne({ _id: req.params.botId, owner: req.user.id });
        if (!bot) return res.status(404).json({ message: 'Bot non trouvé.' });

        const data = await Data.find({ botId: req.params.botId });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Create or update a data entry
router.post('/:botId', auth, async (req, res) => {
    try {
        const { key, value } = req.body;
        const bot = await Bot.findOne({ _id: req.params.botId, owner: req.user.id });
        if (!bot) return res.status(404).json({ message: 'Bot non trouvé.' });

        const entry = await Data.findOneAndUpdate(
            { botId: req.params.botId, key },
            { value, updatedAt: Date.now() },
            { upsert: true, new: true }
        );

        res.json(entry);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Delete a data entry
router.delete('/:botId/:key', auth, async (req, res) => {
    try {
        const bot = await Bot.findOne({ _id: req.params.botId, owner: req.user.id });
        if (!bot) return res.status(404).json({ message: 'Bot non trouvé.' });

        await Data.deleteOne({ botId: req.params.botId, key: req.params.key });
        res.json({ message: 'Donnée supprimée.' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
