const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure data file exists with all new structures
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        images: [],
        social: { insta: 'https://www.instagram.com/menbar.313/', wa: '97332115623' },
        stats: { daily: {}, history: [] },
        prices: { muharram: 25, safar: 20, rabia: 10, rajab: 18, shawwal: 8, single: 3 },
        orders: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

app.use(bodyParser.json());

// 1. Visitor Tracking
app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/index.html') {
        try {
            const data = JSON.parse(fs.readFileSync(DATA_FILE));
            if (!data.stats) data.stats = { daily: {}, history: [] };
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const date = new Date().toISOString().split('T')[0];
            const alreadyVisited = data.stats.history.find(v => v.ip === ip && v.date === date);
            if (!alreadyVisited) {
                data.stats.history.push({ ip, date });
                data.stats.daily[date] = (data.stats.daily[date] || 0) + 1;
                if (data.stats.history.length > 1000) data.stats.history.shift();
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
            }
        } catch (e) {}
    }
    next();
});

app.use(express.static(path.join(__dirname)));
if (fs.existsSync(UPLOADS_DIR)) {
    app.use('/uploads', express.static(UPLOADS_DIR));
}

// API: Get all data
app.get('/api/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    if (!data.prices) data.prices = { muharram: 25, safar: 20, rabia: 10, rajab: 18, shawwal: 8, single: 3, fullyear: 100 };
    if (!data.settings) data.settings = { showFullYear: true };
    if (!data.orders) data.orders = [];
    res.json(data);
});

// API: Log new order
app.post('/api/orders', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.orders.push({ ...req.body, date: new Date().toISOString(), id: Date.now() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// API: Reset orders (Protected fixing robust check)
app.post('/api/orders/reset', (req, res) => {
    if (String(req.body.pass).trim() === '123') {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        data.orders = [];
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true });
    } else {
        res.status(403).json({ error: 'Wrong password' });
    }
});

// API: Update settings
app.post('/api/settings', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    if (!data.settings) data.settings = {};
    data.settings = { ...data.settings, ...req.body };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// API: Update prices
app.post('/api/prices', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.prices = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// API: Update global image order
app.post('/api/data/order', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.images = req.body.images;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// API: Scan for images
app.get('/api/scan-uploads', (req, res) => {
    allFiles.push(...rootFiles);
    res.json(allFiles);
});

// Bulk add images
app.post('/api/images/bulk', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    const newImages = req.body.images.map((img, i) => ({ ...img, id: Date.now() + i }));
    data.images.push(...newImages);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, count: newImages.length });
});

// Delete individual image
app.delete('/api/images/:id', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.images = data.images.filter(img => img.id != req.params.id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// Update social
app.post('/api/social', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.social = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });
