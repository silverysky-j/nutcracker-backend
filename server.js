require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Настройка Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer — принимает файл в память, не на диск
const upload = multer({ storage: multer.memoryStorage() });

// Маршрут для загрузки картинки
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Загружаем картинку в Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'nutcracker' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Возвращаем ссылку на картинку и уникальный ID
    res.json({
      success: true,
      imageUrl: result.secure_url,
      gameId: result.public_id.split('/').pop(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Маршрут для получения картинки по ID
app.get('/game/:id', async (req, res) => {
  try {
    const result = await cloudinary.api.resource(
      `nutcracker/${req.params.id}`
    );
    res.json({
      success: true,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Game not found' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});