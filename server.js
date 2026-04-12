const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'data.json');

// Initial data structure
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ images: [], social: { insta: 'https://www.instagram.com/menbar.313/', wa: '97332115623' } }));
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// API: Get all data
app.get('/api/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
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
    const newImages = req.body.images.map(img => ({ ...img, id: Date.now() + Math.random() }));
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

// Routes
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
