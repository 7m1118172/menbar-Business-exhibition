const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Route for /admin to serve admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🚀 Menbar Website is running!`);
    console.log(`🔗 Main Site: http://localhost:${PORT}`);
    console.log(`🔗 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🔑 Admin Password: 123123`);
    console.log(`=========================================\n`);
});
