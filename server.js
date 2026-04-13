const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ images: [], social: { insta: 'https://www.instagram.com/menbar.313/', wa: '97332115623' } }));
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
if (fs.existsSync(UPLOADS_DIR)) {
    app.use('/uploads', express.static(UPLOADS_DIR));
}

// API: Get all data
app.get('/api/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
});

// Middleware to track visits
app.use((req, res, next) => {
    // Only track main page views, not API or static assets
    if (req.path === '/' || req.path === '/index.html') {
        try {
            const data = JSON.parse(fs.readFileSync(DATA_FILE));
            if (!data.stats) data.stats = { daily: {}, history: [] };
            
            // For Render/Proxy behind environments
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const date = new Date().toISOString().split('T')[0];
            
            // Check if this IP already visited today
            const alreadyVisited = data.stats.history.find(v => v.ip === ip && v.date === date);
            
            if (!alreadyVisited) {
                data.stats.history.push({ ip, date });
                data.stats.daily[date] = (data.stats.daily[date] || 0) + 1;
                
                // Keep history clean (last 1000 unique records)
                if (data.stats.history.length > 1000) data.stats.history.shift();
                
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.error("Tracking error:", e);
        }
    }
    next();
});

// API: Scan for images in both root and uploads
app.get('/api/scan-uploads', (req, res) => {
    let allFiles = [];
    
    // Scan uploads folder if exists
    if (fs.existsSync(UPLOADS_DIR)) {
        const files = fs.readdirSync(UPLOADS_DIR)
            .filter(file => ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(file).toLowerCase()))
            .map(file => `uploads/${file}`);
        allFiles.push(...files);
    }
    
    // Scan root folder (excluding known system files)
    const rootFiles = fs.readdirSync(__dirname)
        .filter(file => {
            const ext = path.extname(file).toLowerCase();
            const isImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
            const isSystem = ['logo.png', 'pattern.png'].includes(file.toLowerCase());
            return isImage && !isSystem;
        })
        .map(file => file);
    
    allFiles.push(...rootFiles);
    
    res.json(allFiles);
});

// API: Bulk add images
app.post('/api/images/bulk', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    const newImages = req.body.images.map((img, i) => ({ ...img, id: Date.now() + i }));
    data.images.push(...newImages);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, count: newImages.length });
});

// API: Delete image
app.delete('/api/images/:id', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.images = data.images.filter(img => img.id != req.params.id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// API: Update social links
app.post('/api/social', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.social = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
