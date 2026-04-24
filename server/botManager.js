const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const hostedBotsDir = path.join(__dirname, 'hosted_bots');
if (!fs.existsSync(hostedBotsDir)) {
    fs.mkdirSync(hostedBotsDir, { recursive: true });
}

// Map to store running processes: botId => childProcess
const runningBots = new Map();

const botManager = {
    startBot: async (bot) => {
        const botIdStr = bot._id.toString();
        const botDir = path.join(hostedBotsDir, botIdStr);

        // Kill existing if already running
        if (runningBots.has(botIdStr)) {
            await botManager.stopBot(botIdStr);
        }

        // 1. Create bot directory
        if (!fs.existsSync(botDir)) {
            fs.mkdirSync(botDir, { recursive: true });
        }

        // 2. Write all files
        if (bot.files && bot.files.length > 0) {
            bot.files.forEach(file => {
                const filePath = path.join(botDir, file.name);
                const fileDir = path.dirname(filePath);
                if (!fs.existsSync(fileDir)) {
                    fs.mkdirSync(fileDir, { recursive: true });
                }
                fs.writeFileSync(filePath, file.content);
            });
        }

        // 3. Create .env file with token
        fs.writeFileSync(path.join(botDir, '.env'), `DISCORD_TOKEN=${bot.token}\n`);

        // 4. Spawn process
        const mainFile = bot.mainFile || 'index.js';

        console.log(`🚀 Starting bot ${bot.name} (${botIdStr})...`);
        const child = spawn('node', [mainFile], {
            cwd: botDir,
            env: { ...process.env, DISCORD_TOKEN: bot.token }
        });

        // Save to map
        runningBots.set(botIdStr, child);

        // Handle output
        child.stdout.on('data', (data) => {
            console.log(`[BOT ${bot.name}]`, data.toString().trim());
        });

        child.stderr.on('data', (data) => {
            console.error(`[BOT ${bot.name} ERR]`, data.toString().trim());
        });

        child.on('close', (code) => {
            console.log(`[BOT ${bot.name}] Exited with code ${code}`);
            runningBots.delete(botIdStr);

            // Note: In a production app, we would update the database status here
            // But we'll keep it simple for now.
        });

        return true;
    },

    stopBot: async (botId) => {
        const botIdStr = botId.toString();
        const child = runningBots.get(botIdStr);
        if (child) {
            console.log(`🛑 Stopping bot (${botIdStr})...`);
            child.kill();
            runningBots.delete(botIdStr);
            return true;
        }
        return false;
    },

    restartBot: async (bot) => {
        await botManager.stopBot(bot._id);
        await new Promise(r => setTimeout(r, 1000));
        await botManager.startBot(bot);
        return true;
    },

    isBotRunning: (botId) => {
        return runningBots.has(botId.toString());
    }
};

module.exports = botManager;
