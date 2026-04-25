const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novahost')
    .then(() => {
        console.log('✅ MongoDB Connected');
        // Auto-start bots on boot
        startAllBots();
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

async function startAllBots() {
    const Bot = require('./models/Bot');
    const botManager = require('./botManager');
    
    console.log('🔄 Auto-starting online bots...');
    try {
        const onlineBots = await Bot.find({ status: 'online' });
        console.log(`📡 Found ${onlineBots.length} bots to restart.`);
        for (const bot of onlineBots) {
            await botManager.startBot(bot);
        }
    } catch (err) {
        console.error('❌ Error auto-starting bots:', err);
    }
}

// Keep-Alive Ping (Try to stay awake)
const APP_URL = 'https://novahost-backend.onrender.com';
setInterval(async () => {
    try {
        await fetch(APP_URL);
        console.log('💓 Keep-alive ping sent');
    } catch (e) {}
}, 10 * 60 * 1000); // 10 minutes

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    socket.on('join-bot-logs', (botId) => {
        socket.join(`logs-${botId}`);
        console.log(`📡 User joined logs for bot: ${botId}`);
        
        // Emit mock logs every few seconds for demonstration
        const interval = setInterval(() => {
            socket.emit('bot-log', {
                timestamp: new Date().toLocaleTimeString(),
                message: `[System] Monitoring bot status... CPU: ${Math.floor(Math.random() * 5)}% | RAM: ${Math.floor(Math.random() * 10) + 120}MB`,
                type: 'info'
            });
        }, 3000);

        socket.on('disconnect', () => {
            clearInterval(interval);
        });
    });

    socket.on('disconnect', () => {
        console.log('🔌 User disconnected');
    });
});

// Basic Route
app.get('/', (req, res) => {
    res.send('NovaHost API is running...');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bots', require('./routes/bots'));
app.use('/api/files', require('./routes/files'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
