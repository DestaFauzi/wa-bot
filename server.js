const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cors = require('cors');
const qrcode = require('qrcode-terminal');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// WhatsApp Client
let client;
let isReady = false;
let qrCodeString = null;
let isInitializing = false;

// Initialize WhatsApp Client
function initializeWhatsApp() {
    // Prevent multiple initializations
    if (isInitializing) {
        console.log('WhatsApp client is already initializing...');
        return;
    }
    
    isInitializing = true;
    console.log('Starting WhatsApp client initialization...');
    
    try {
        client = new Client({
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-extensions',
                    '--disable-default-apps',
                    '--disable-sync',
                    '--disable-translate',
                    '--hide-scrollbars',
                    '--metrics-recording-only',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--no-first-run',
                    '--safebrowsing-disable-auto-update',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI',
                    '--disable-component-extensions-with-background-pages'
                ],
                executablePath: undefined
            },
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
            }
        });

        client.on('loading_screen', (percent, message) => {
            console.log('LOADING SCREEN', percent, message);
        });

        client.on('qr', (qr) => {
            qrCodeString = qr;
            console.log('QR Code received! Please scan with your phone.');
            console.log('QR Code String:', qr);
            qrcode.generate(qr, { small: true });
        });

        client.on('authenticated', () => {
            console.log('WhatsApp authenticated successfully!');
            qrCodeString = null;
        });

        client.on('ready', () => {
            isReady = true;
            isInitializing = false;
            qrCodeString = null;
            console.log('WhatsApp client is ready!');
            console.log('You can now use the web interface to send messages.');
        });

        client.on('auth_failure', (msg) => {
            console.error('Authentication failed:', msg);
            isInitializing = false;
            qrCodeString = null;
            // Retry initialization after 5 seconds
            setTimeout(() => {
                console.log('Retrying WhatsApp initialization...');
                initializeWhatsApp();
            }, 5000);
        });

        client.on('disconnected', (reason) => {
            console.log('WhatsApp disconnected:', reason);
            isReady = false;
            isInitializing = false;
            qrCodeString = null;
            // Retry initialization after 3 seconds
            setTimeout(() => {
                console.log('Retrying WhatsApp initialization due to disconnection...');
                initializeWhatsApp();
            }, 3000);
        });

        client.on('message', (message) => {
            console.log('New message:', message.body);
        });

        // Error handling
        client.on('error', (error) => {
            console.error('WhatsApp client error:', error);
            isInitializing = false;
        });

        // Initialize client
        client.initialize().catch(error => {
            console.error('Failed to initialize WhatsApp client:', error);
            isInitializing = false;
        });

    } catch (error) {
        console.error('Error creating WhatsApp client:', error);
        isInitializing = false;
    }
}

// API Routes
app.get('/api/status', (req, res) => {
    res.json({
        isReady: isReady,
        isInitializing: isInitializing,
        qrCode: qrCodeString,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/groups', async (req, res) => {
    if (!isReady) {
        return res.status(400).json({ 
            error: 'WhatsApp client is not ready. Please wait or scan QR code first.',
            isInitializing: isInitializing
        });
    }

    try {
        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);
        
        const groupData = groups.map(group => ({
            id: group.id._serialized,
            name: group.name,
            participants: group.participants ? group.participants.length : 0,
            isGroup: true,
            timestamp: group.timestamp
        }));

        res.json(groupData);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups: ' + error.message });
    }
});

app.post('/api/send-message', async (req, res) => {
    if (!isReady) {
        return res.status(400).json({ 
            error: 'WhatsApp client is not ready',
            isInitializing: isInitializing
        });
    }

    const { groupId, message } = req.body;

    if (!groupId || !message) {
        return res.status(400).json({ 
            error: 'Group ID and message are required' 
        });
    }

    try {
        await client.sendMessage(groupId, message);
        console.log(`Message sent to group ${groupId}: ${message}`);
        res.json({ 
            success: true, 
            message: 'Message sent successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ 
            error: 'Failed to send message: ' + error.message 
        });
    }
});

app.post('/api/schedule-message', async (req, res) => {
    const { groupId, message, scheduleTime } = req.body;

    if (!groupId || !message || !scheduleTime) {
        return res.status(400).json({ 
            error: 'Group ID, message, and schedule time are required' 
        });
    }

    try {
        const now = new Date();
        const scheduleDate = new Date(scheduleTime);
        const delay = scheduleDate.getTime() - now.getTime();

        if (delay <= 0) {
            return res.status(400).json({ 
                error: 'Schedule time must be in the future' 
            });
        }

        setTimeout(async () => {
            try {
                if (isReady) {
                    await client.sendMessage(groupId, message);
                    console.log(`Scheduled message sent to group ${groupId}: ${message}`);
                } else {
                    console.error('WhatsApp client not ready when scheduled message was due');
                }
            } catch (error) {
                console.error('Error sending scheduled message:', error);
            }
        }, delay);

        res.json({ 
            success: true, 
            message: 'Message scheduled successfully',
            scheduleTime: scheduleTime,
            delay: delay
        });
    } catch (error) {
        console.error('Error scheduling message:', error);
        res.status(500).json({ 
            error: 'Failed to schedule message: ' + error.message 
        });
    }
});

// Restart WhatsApp client endpoint
app.post('/api/restart', (req, res) => {
    try {
        if (client) {
            client.destroy();
        }
        isReady = false;
        isInitializing = false;
        qrCodeString = null;
        
        setTimeout(() => {
            initializeWhatsApp();
        }, 1000);
        
        res.json({ 
            success: true, 
            message: 'WhatsApp client restarted' 
        });
    } catch (error) {
        console.error('Error restarting client:', error);
        res.status(500).json({ 
            error: 'Failed to restart client: ' + error.message 
        });
    }
});

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Initializing WhatsApp client...');
    
    // Clean up any existing auth data on startup
    setTimeout(() => {
        initializeWhatsApp();
    }, 1000);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    if (client) {
        client.destroy();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    if (client) {
        client.destroy();
    }
    process.exit(0);
});