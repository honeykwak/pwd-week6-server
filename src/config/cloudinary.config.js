// src/config/cloudinary.config.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'db3vvy06c',
  api_key: process.env.CLOUDINARY_API_KEY || '294568144822579',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'NLtVwGDzbHsJkeBVrBZHzCFLp-w',
});

// Cloudinary 저장소 설정
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ajou-foodmap/avatars', // Cloudinary 폴더명
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill' }, // 400x400 크기로 리사이즈
      { quality: 'auto' }, // 자동 품질 최적화
    ],
  },
});

// Multer 설정
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
    }
  },
});

module.exports = { cloudinary, upload };

