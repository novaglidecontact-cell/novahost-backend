const express = require('express');
const router = express.Router();
const Bot = require('../models/Bot');
const User = require('../models/User');
const auth = require('../middleware/auth');
const checkPlan = require('../middleware/checkPlan');
const botManager = require('../botManager');

// Get all user bots
router.get('/', auth, async (req, res) => {
    try {
        const bots = await Bot.find({ owner: req.user.id });
        res.json(bots);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des bots.' });
    }
});

// Add a new bot
router.post('/', [auth, checkPlan], async (req, res) => {
    try {
        const { name, token } = req.body;
        // Check plan limits
        const botCount = await Bot.countDocuments({ owner: req.user.id });
        const user = await User.findById(req.user.id);
        
        if (user.plan === 'Free' && botCount >= 1) {
            return res.status(403).json({ message: 'Limite atteinte : Le plan Free est limité à 1 bot. Passez en Pro pour en ajouter plus !' });
        }

        const defaultCode = `const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
  console.log('Connecté en tant que ' + client.user.tag + ' !');
});

client.login(process.env.DISCORD_TOKEN);
`;

        const bot = new Bot({
            name,
            token,
            owner: req.user.id,
            files: [{ name: 'index.js', content: defaultCode }]
        });
        await bot.save();
        
        // Add bot to user's list
        await User.findByIdAndUpdate(req.user.id, { $push: { bots: bot._id } });

        res.status(201).json(bot);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la création du bot.' });
    }
});

// Bot actions (start, stop, restart)
router.post('/:id/:action', [auth, checkPlan], async (req, res) => {
    try {
        const { id, action } = req.params;
        const bot = await Bot.findOne({ _id: id, owner: req.user.id });
        if (!bot) return res.status(404).json({ message: 'Bot non trouvé.' });

        if (action === 'start') {
            await botManager.startBot(bot);
            bot.status = 'online';
        }
        if (action === 'stop') {
            await botManager.stopBot(bot._id);
            bot.status = 'offline';
        }
        if (action === 'restart') {
            await botManager.restartBot(bot);
            bot.status = 'online';
        }

        await bot.save();
        res.json({ message: `Bot ${action}é avec succès.`, status: bot.status });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de l\'action sur le bot.' });
    }
});

// Delete a bot
router.delete('/:id', auth, async (req, res) => {
    try {
        const bot = await Bot.findOne({ _id: req.params.id, owner: req.user.id });
        if (!bot) return res.status(404).json({ message: 'Bot non trouvé.' });

        // Arrêter le processus s'il tourne
        await botManager.stopBot(bot._id);

        await Bot.deleteOne({ _id: req.params.id });
        
        // Remove from user's bots array
        await User.findByIdAndUpdate(req.user.id, { $pull: { bots: req.params.id } });

        res.json({ message: 'Bot supprimé avec succès.' });
    } catch (err) {
        console.error('Delete Error:', err);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression : ' + err.message });
    }
});

module.exports = router;
