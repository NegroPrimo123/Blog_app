const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Создаем папки, если они не существуют
const uploadDir = path.join(__dirname, '../uploads');
const thumbnailsDir = path.join(uploadDir, 'thumbnails');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Настройка Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('image');

// Middleware для обработки загрузки и создания миниатюры
const uploadImage = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ 
                status: 'error',
                message: err 
            });
        }

        if (!req.file) {
            return next();
        }

        try {
            // Создаем миниатюру
            const thumbnailPath = path.join(thumbnailsDir, req.file.filename);
            await sharp(req.file.path)
                .resize(300, 300)
                .toFile(thumbnailPath);

            // Добавляем пути к файлам в запрос
            req.imageData = {
                original: `/uploads/${req.file.filename}`,
                thumbnail: `/uploads/thumbnails/${req.file.filename}`
            };

            next();
        } catch (error) {
            console.error('Image processing error:', error);
            // Удаляем загруженный файл в случае ошибки
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ 
                status: 'error',
                message: 'Error processing image'
            });
        }
    });
};

module.exports = uploadImage;