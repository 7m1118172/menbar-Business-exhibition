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
