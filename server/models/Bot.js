const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
    name: { type: String, required: true },
    token: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['online', 'offline', 'error'], default: 'offline' },
    ramUsage: { type: Number, default: 0 },
    cpuUsage: { type: Number, default: 0 },
    uptime: { type: Number, default: 0 },
    path: { type: String }, // Path to the bot's files
    mainFile: { type: String, default: 'index.js' },
    files: [{
        name: { type: String, required: true },
        content: { type: String, default: '' }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bot', botSchema);
