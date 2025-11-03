const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const { AppError } = require('./errorHandler');
const path = require('path');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// File size limits
const FILE_SIZE_LIMITS = {
  avatar: 2 * 1024 * 1024, // 2MB
  resume: 5 * 1024 * 1024, // 5MB
  video: 50 * 1024 * 1024, // 50MB
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024 // 10MB
};

// File type validation
const fileFilter = (allowedTypes) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError(`Only ${allowedTypes.join(', ')} files are allowed`, 400), false);
  }
};

// Create S3 upload middleware
const createS3Upload = (folder, fileType, fileSize) => {
  return multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        cb(null, fileName);
      }
    }),
    limits: { fileSize },
    fileFilter: fileFilter(fileType)
  });
};

// Avatar upload middleware
exports.uploadAvatar = createS3Upload(
  'avatars',
  ['.jpg', '.jpeg', '.png'],
  FILE_SIZE_LIMITS.avatar
).single('avatar');

// Resume upload middleware
exports.uploadResume = createS3Upload(
  'resumes',
  ['.pdf', '.doc', '.docx'],
  FILE_SIZE_LIMITS.resume
).single('resume');

// Video upload middleware
exports.uploadVideo = createS3Upload(
  'videos',
  ['.mp4', '.webm'],
  FILE_SIZE_LIMITS.video
).single('video');

// ID document upload middleware
exports.uploadIdDocument = createS3Upload(
  'documents',
  ['.jpg', '.jpeg', '.png', '.pdf'],
  FILE_SIZE_LIMITS.document
).single('idDocument');

// Experience images upload middleware
exports.uploadExperienceImages = createS3Upload(
  'experiences',
  ['.jpg', '.jpeg', '.png'],
  FILE_SIZE_LIMITS.image
).array('images', 10);

// Error handling middleware for multer
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'File size too large'
        }
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        message: err.message
      }
    });
  }
  next(err);
};