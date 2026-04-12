const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories and files exist
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ images: [], social: { insta: 'https://www.instagram.com/menbar.313/', wa: '97332115623' } }));
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(UPLOADS_DIR));

// API: Get all data
app.get('/api/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
});

// API: Scan uploads folder for unassigned images
app.get('/api/scan-uploads', (req, res) => {
    const files = fs.readdirSync(UPLOADS_DIR).filter(file => 
        ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(file).toLowerCase())
    );
    res.json(files);
});

// API: Add image
app.post('/api/images', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    data.images.push({ ...req.body, id: Date.now() });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
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

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
