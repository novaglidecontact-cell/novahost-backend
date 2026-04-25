const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
    botId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bot',
        required: true
    },
    key: {
        type: String,
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Assurer qu'une clé est unique par bot
DataSchema.index({ botId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Data', DataSchema);
