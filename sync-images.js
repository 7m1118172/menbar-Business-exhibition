const fs = require('fs');
const path = require('path');

// Folder names
const NEW_ADS_DIR = path.join(__dirname, 'أعمال_جديدة');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_FILE = path.join(__dirname, 'data.json');

// Ensure folders exist
if (!fs.existsSync(NEW_ADS_DIR)) fs.mkdirSync(NEW_ADS_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// 1. Move files from 'أعمال_جديدة' to 'uploads'
const newFiles = fs.readdirSync(NEW_ADS_DIR).filter(file => 
    ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(file).toLowerCase())
);

newFiles.forEach(file => {
    const oldPath = path.join(NEW_ADS_DIR, file);
    const newPath = path.join(UPLOADS_DIR, file);
    fs.renameSync(oldPath, newPath); // Move the file
});

console.log(`🚀 تم نقل ${newFiles.length} صورة جديدة إلى مجلد التخزين.`);
console.log(`⚙️ جاري تجهيز الملفات للرفع إلى GitHub...`);
